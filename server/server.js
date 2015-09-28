var Hapi            = require('hapi');
var path            = require('path');
var fs              = require('fs');
var bcrypt          = require('bcrypt');
var util            = require('util');
var stream          = require('stream');
var injector        = require('electrolyte');
var serverConfig    = require('../config/config');

injector.loader(injector.node('handlers'));

var getBridgeActual = injector.create('get-bridge-actual');

exports = module.exports = function (logger) {
  var options = {
    port: serverConfig.port,
    uri: 'https://'+serverConfig.iBridge.hostname+':'+serverConfig.port+'',
    routes: {
      cors: true,
      cache: {
        expiresIn: 30 * 1000,
        privacy: 'private'
      }
    }
  };
  var plugins = [
    { register: require('inert') },
    { register: require('vision') },
    { register: require('hapi-auth-bearer-token') },
    { register: require('lout'),
      options: {
        endpoint: '/bridges/docs'
      }
    }
  ];
  // Setup new Hapi server
  var server = new Hapi.Server({
    cache: {
      engine: require('catbox-redis'),
      host: serverConfig.redis.host,
      port: serverConfig.redis.port,
      partition: 'cache'
    }
  });
  server.method('getBridgeActual', getBridgeActual, {
    cache: { expiresIn: 30 * 1000, generateTimeout: 500 }
  });
  server.connection(options);
  var io = require('socket.io')(server.listener);
  var bridgeEventSocket = io.on('connection', function (socket) {
    // disconnect users who try to send us data
    socket.conn.on('data', function (chunk) {
      socket.disconnect();
      var logString = util.format("%s [%s] tried to send data and was disconnected",
        (new Date()).getTime(),
        socket.handshake.headers['x-forwarded-for'] || this.remoteAddress
      );
      // console.log is for fail2ban, leave both in
      console.log(logString);
      logger.warn(logString);
    });

    socket.emit('bridge data', serverConfig.bridges);
    var logString = util.format("%s [%s] %s sent from %s",
      (new Date()).getTime(),
      socket.handshake.headers['x-forwarded-for'] || socket.handshake.address,
      "socket",
      socket.handshake.headers.referer
    );
    logger.info(logString);
  });

  var eventEmitters = {
    bridgeEventSocket:  bridgeEventSocket,
    bridgeSSE:          new stream.PassThrough()
  };
  eventEmitters.bridgeSSE.setMaxListeners(0);

  // Redis for auth
  var redis = require("redis");
  var redisStore = redis.createClient(serverConfig.redis.port, serverConfig.redis.host);
  logger.info('Connected to Redis at: '+ redisStore.address);

  server.register(plugins, function (err) {
    if (err) logger.error(err);
    server.on('response', function (request) {
      var remoteAddress = request.headers['x-forwarded-for'] || request.info.remoteAddress;
      var logString = util.format("%s [%s] %s %s - %s",
        (new Date()).getTime(),
        remoteAddress,
        request.method,
        request.url.path,
        request.response.statusCode
      );
      // Ignore AWS load balancer pings so they don't bloat the logs
      if (remoteAddress != '10.131.1.236' && remoteAddress != '10.131.0.75') {
        logger.info(logString);
      }
    });
  });

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

  server.route(require('../routes')(eventEmitters));

  return server;
};

exports['@singleton'] = true;
exports['@require'] = ['logger'];
