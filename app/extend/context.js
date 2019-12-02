'use strict';

const uid = require('uid-safe');
const crypto = require('crypto');
const utility = require('utility');
const hash = crypto.createHash('sha256');

const CIPHER = 'aes-256-cfb';

let iv = '';

// 微信 登录凭证校验 接口
const wxAuthUrl = 'https://api.weixin.qq.com/sns/jscode2session';

module.exports = {
  get mpSession() {
    const client = {};
    const ctx = this;
    const { app } = this;
    const config = app.config.mpSession;
    const tokenIdFromHttpBody = ctx.get(config.headerTokenKey);
    const redisInstance = app.redis.get(config.redisInstanceName);

    if (iv === '') {
      hash.update(config.keys);
      iv = Buffer.from(hash.digest('hex').substring(0, 16));
    }

    /**
     * 登录，把微信登录接口返回的 openid 和 session_id 写到 redis 中
     *
     * @param code {String} 临时授权码
     * @return {Object} 微信返回的数据加 tokenId
     */
    client.login = async function login({ code }) {
      let tokenId = null;
      const authUrl = `${wxAuthUrl}?appid=${config.appId}&secret=${config.appSecret}&js_code=${code}&grant_type=authorization_code`;
      const result = await ctx.curl(authUrl, {
        dataType: 'json',
      });

      if (result.data.errorCode === 0) {
        const redisKey = `${Date.now()}-${uid.sync(24)}`;
        await redisInstance.set(
          redisKey,
          JSON.stringify(result.data),
          'PX',
          config.ttlMilliSeconds
        );
        const encryptString = encrypt(redisKey, config.keys, iv);
        tokenId = utility.base64encode(encryptString, true);
      }

      return Object.assign(result.data, { tokenId });
    };

    /**
     * 更新过期时间
     *
     * @return {Promise<{status}>} 更新 redis 中用户信息的过期信息
     */
    client.update = async function() {
      const redisKey = getRedisKey(tokenIdFromHttpBody, config.keys, iv, ctx);
      return await redisInstance.pexpire(redisKey, config.ttlMilliSeconds);
    };

    /**
     * 退出登录，删除 redis 中的信息
     *
     * @return {Promise<{status}>} 删除 redis 中的用户信息：openid, session_id
     */
    client.logout = async function() {
      const redisKey = getRedisKey(tokenIdFromHttpBody, config.keys, iv, ctx);
      return await redisInstance.del(redisKey);
    };

    /**
     * 获取保存在 redis 中的用户信息（openid，session_id）
     *
     * @return {Promise<{status}|*|*>} 存储在 redis 中的用户信息：openid, session_id
     */
    client.info = async function() {
      let info;
      const redisKey = getRedisKey(tokenIdFromHttpBody, config.keys, iv, ctx);
      info = await redisInstance.get(redisKey);
      try {
        info = JSON.parse(info);
      } catch (err) {
        ctx.logger.error('[egg-mp-session]', err);
      }

      return info;
    };

    return client;
  },
};

function getRedisKey(tokenIdFromHttpBody, keys, iv, ctx) {
  try {
    const decodeRedisKey = utility.base64decode(
      tokenIdFromHttpBody,
      true,
      'buffer'
    );

    return decrypt(decodeRedisKey, keys, iv, ctx);
  } catch (err) {
    ctx.logger.error(err);
    return '';
  }
}

function crypt(cipherObj, data) {
  const text = cipherObj.update(data, 'utf8');
  const pad = cipherObj.final();
  return Buffer.concat([text, pad]);
}

function encrypt(data, key, iv) {
  const cipher = crypto.createCipheriv(CIPHER, key, iv);
  return crypt(cipher, data);
}

function decrypt(data, key, iv, ctx) {
  try {
    const cipher = crypto.createDecipheriv(CIPHER, key, iv);
    return crypt(cipher, data);
  } catch (err) {
    ctx.logger.error('[egg-mp-session error]', err);
    throw err;
  }
}
