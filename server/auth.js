var bcrypt = require('bcrypt');
var redis  = require("redis");

exports = module.exports = function (logger, serverConfig) {
  var addServerAuthentication = function (server) {
    // Redis for auth
    var redisStore = redis.createClient(serverConfig.redis.port, serverConfig.redis.host);
    logger.info('Connected to Redis at: '+ redisStore.address);

    server.auth.strategy('simple', 'bearer-access-token', {
      allowMultipleHeaders: true,
      validateFunc: function (token, callback) {
        var credentials = token.split(':');
        var email = credentials[0];
        var secret = credentials[1];
        // Find user by email
        redisStore.get(email, function (err, hashToken) {
          if (err) errorResponse(err);
          // Compare the stored hash with the token provided
          bcrypt.compare(secret, hashToken, function(err, res) {
            if (err) errorResponse(err);
            if (res) {
              logger.info('User: '+ email +' has authenticated');
              return callback(null, true, { user: email, token: secret });
            } else {
              logger.warn('User: '+ email +' failed authentication');
              return callback(null, false, { user: email, token: secret });
            }
          });
        });
        function errorResponse(err) {
          logger.error(err);
          return callback(null, false, { user: null, token: secret });
        }
      }
    });
  };
  return addServerAuthentication;
};

exports['@singleton'] = true;
exports['@require'] = [ 'logger', 'config' ];
