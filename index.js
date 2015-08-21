require('./config/logging');
var
  Hapi            = require('hapi'),
  Path            = require('path'),
  fs              = require('fs'),
  inert           = require('inert'),
  vision          = require('vision'),
  lout            = require('lout'),
  hapiBearerToken = require('hapi-auth-bearer-token'),
  util            = require('util'),
  wlog            = require('winston'),
  port            = require('./config/config').port,
  bridgeStatuses  = require('./config/config').bridges
;
var options = {
  port: port
  // tls: {
  //   key: fs.readFileSync(Path.join(__dirname + '/keys/server.key')),
  //   cert: fs.readFileSync(Path.join(__dirname + '/keys/server.crt'))
  //   // ca: fs.readFileSync(Path.join(__dirname + '/keys/server.csr'))
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
    // User.findWithToken(token);
    // if (user) {
    //   callback(null, true, { user: user.email, token: token });
    // } else {
    //   callback(null, false, { user: null, token: token });
    // }
    if (token === '1234') {
      callback(null, true, { token: token });
    } else {
      callback(null, false, { token: token });
    }
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
