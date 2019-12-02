'use strict';

const assert = require('assert');

module.exports = app => {
  const config = app.config.mpSession;

  assert(
    config.appId &&
      config.appSecret &&
      config.redisInstanceName &&
      config.headerTokenKey,
    '[egg-mp-session] appSecret, appSecret, redisInstanceName, egg-redis is required'
  );

  assert(
    app.config.keys,
    "[egg-mp-session] 'config.keys' is required on config"
  );

  if (app.config.keys.indexOf(',') > -1) {
    app.config.mpSession.keys = app.config.keys.split(',')[0];
  } else {
    app.config.mpSession.keys = app.config.keys;
  }
};
