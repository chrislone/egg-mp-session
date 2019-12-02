'use strict';

const ms = require('ms');

exports.mpSession = {
  // 必须，微信小程序 AppId
  appId: '',
  // 必须，微信小程序 AppSecret
  appSecret: '',
  // 必须，用于存放用户信息的 redis 实例名
  redisInstanceName: '',
  // 必须，用于读取微信小程序请求时放到请求头的 tokenId
  headerTokenKey: '',
  // redis 的 time for life，此处使用 `PX`，默认 10 分钟，时间会通过 ms 模块转为毫秒
  // ref: https://redis.io/commands/set
  ttlMilliSeconds: ms('10m'),
};
