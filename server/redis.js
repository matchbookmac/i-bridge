var redis = require("redis");

exports = module.exports = function (logger, serverConfig) {
  var redisStore = redis.createClient(serverConfig.redis.port, serverConfig.redis.host);
  redisStore.on("error", function (err) {
    logger.error("Redis error: " + err);
  });
  redisStore.on("connect", function () {
    logger.info('Connected to Redis at: '+ redisStore.address);
  });

  return redisStore;
};

exports['@singleton'] = true;
exports['@require'] = [ 'logger', 'config' ];
