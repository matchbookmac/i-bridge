require('./config/logging');
var
  Hapi           = require('hapi'),
  Path           = require('path'),
  fs             = require('fs'),
  util           = require('util'),
  wlog           = require('winston'),
  port           = require('./config/config').port,
  bridgeStatuses = require('./config/config').bridges
;
var options = {
  port: 443,
  tls: {
    key: fs.readFileSync(Path.join(__dirname + '/keys/server.key')),
    cert: fs.readFileSync(Path.join(__dirname + '/keys/server.crt')),
    ca: fs.readFileSync(Path.join(__dirname + '/keys/server.csr'))
  }
};
console.log(options);
var server = new Hapi.Server();
server.connection(options);
var io     = require('socket.io')(server.listener);

var bridgeEventSocket = io.on('connection', function (socket) {
  socket.emit('bridge data', bridgeStatuses);
});

server.views({
  engines: {
    html: require('handlebars')
  },
  path: Path.join(__dirname, 'public/templates')
});

server.route(require('./routes'));

module .exports = (function () {
  server.start(function(){
    wlog.info('Server running at:', server.info.uri);
  });

  return server;
})();
