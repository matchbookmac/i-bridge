require('./config/logging');
var Hapi            = require('hapi');
var Path            = require('path');
var fs              = require('fs');
var inert           = require('inert');
var vision          = require('vision');
var lout            = require('lout');
var hapiBearerToken = require('hapi-auth-bearer-token');
var util            = require('util');
var wlog            = require('winston');
var port            = require('./config/config').port;
var bridgeStatuses  = require('./config/config').bridges;
var User            = require('./models/index').User;
var https           = require('https');
var sslConfig       = require('ssl-config')('intermediate');
var options         = {
  port: port
  // tls: {
  //   key: fs.readFileSync(Path.join(__dirname + '/keys/server.key')),
  //   cert: fs.readFileSync(Path.join(__dirname + '/keys/server.crt')),
  //   ca: fs.readFileSync(Path.join(__dirname + '/keys/cs.crt'), 'utf8'),
  //   requestCert: true,
  //   rejectUnauthorized: false
  // }
};
var plugins = [
  { register: inert },
  { register: vision },
  { register: hapiBearerToken },
  { register: lout,
    options: {
      filterRoutes: function (route) {
        return !/^\/public\/.+/.test(route.path);
      }
    }
  }
];

var server = new Hapi.Server();
server.connection(options);
var io = require('socket.io')(server.listener);

var bridgeEventSocket = io.on('connection', function (socket) {
  socket.emit('bridge data', bridgeStatuses);
  console.log("hi!");
});

server.register(plugins, function (err) {
  if (err) wlog.error(err);
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

server.views({
  engines: {
    html: require('handlebars')
  },
  path: Path.join(__dirname, 'public/templates')
});

server.route(require('./routes')(bridgeEventSocket));

module .exports = (function () {
  server.start(function(){
    wlog.info('Server running at:', server.info.uri);
  });
  return server;
})();
