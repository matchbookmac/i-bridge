require('./config/logging');
var Hapi            = require('hapi');
var path            = require('path');
var fs              = require('fs');
var util            = require('util');
var stream          = require('stream');
var logger          = require('./config/logging');
var User            = require('./models/index').user;
var serverConfig    = require('./config/config');

var options = {
  port: serverConfig.port,
  uri: 'https://api.multco.us:443',
  routes: {
    cors: true
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
var server = new Hapi.Server();
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
    if (remoteAddress !== '10.131.1.236' || '10.131.0.75') {
      logger.info(logString);
    }
  });
});

server.auth.strategy('simple', 'bearer-access-token', {
  validateFunc: function (token, callback) {
    var request = this;
    var user    = User.findWithToken(token, function (user) {
      if (user) {
        callback(null, true, { user: user.email, token: token });
      } else {
        callback(null, false, { user: null, token: token });
      }
    });
  }
});

server.route(require('./routes')(eventEmitters));

module .exports = (function () {
  server.start(function(){
    logger.info('Server running at:', server.info.uri);
  });
  return server;
})();
