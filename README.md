# egg-mp-session

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Test coverage][codecov-image]][codecov-url]
[![David deps][david-image]][david-url]
[![Known Vulnerabilities][snyk-image]][snyk-url]
[![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/egg-mp-session.svg?style=flat-square
[npm-url]: https://npmjs.org/package/egg-mp-session
[travis-image]: https://img.shields.io/travis/eggjs/egg-mp-session.svg?style=flat-square
[travis-url]: https://travis-ci.org/eggjs/egg-mp-session
[codecov-image]: https://img.shields.io/codecov/c/github/eggjs/egg-mp-session.svg?style=flat-square
[codecov-url]: https://codecov.io/github/eggjs/egg-mp-session?branch=master
[david-image]: https://img.shields.io/david/eggjs/egg-mp-session.svg?style=flat-square
[david-url]: https://david-dm.org/eggjs/egg-mp-session
[snyk-image]: https://snyk.io/test/npm/egg-mp-session/badge.svg?style=flat-square
[snyk-url]: https://snyk.io/test/npm/egg-mp-session
[download-image]: https://img.shields.io/npm/dm/egg-mp-session.svg?style=flat-square
[download-url]: https://npmjs.org/package/egg-mp-session

<!--
Description here.
-->

## Install

```bash
$ npm i egg-mp-session --save
```

## Usage

```js
// {app_root}/config/plugin.js
exports.mpSession = {
  enable: true,
  package: 'egg-mp-session',
};
```

#### 登录

```js
async login(ctx) {
  const { code } = ctx.request.body;
  const loginResult = await ctx.mpSession.login({ code });

  ctx.body = {
    tokenId: loginResult.tokenId,
  };
}
```

#### 获取信息

```js
async info(ctx) {
  /**
  * => {openid=xxxxxxxx, session_id=xxxxxxxx}
  */
  const userInfo = await ctx.mpSession.info();

  ctx.body = {
    userInfo
  };
}
```

#### 更新用户信息过期时间

```js
async update(ctx) {
  /**
  * 返回 redis egg-redis 的 pexpire 操作结果
  * ref：https://redis.io/commands/pexpire
  */
  const redisStatus = await ctx.mpSession.update();

  ctx.body = {
    status: redisStatus
  };
}
```

#### 退出登录，删除 redis 中的用户信息

```js
async logout(ctx) {
  /**
  * 返回 redis egg-redis 的 del 操作结果
  * ref：https://redis.io/commands/del
  */
  const redisStatus = await ctx.mpSession.logout();

  ctx.body = {
    status: redisStatus
  };
}
```

## Configuration

```js
// {app_root}/config/config.default.js
exports.mpSession = {};
```

see [config/config.default.js](config/config.default.js) for more detail.

## Example

<!-- example here -->

## Questions & Suggestions

Please open an issue [here](https://github.com/chrislone/egg-mp-session/issues).

## License

[MIT](LICENSE)
