var
  Hapi    = require('hapi'),
  Path    = require('path'),
  wlog    = require('winston'),
  mysql   = require('mysql'),
  moment  = require('moment'),
  receivePost = require('./modules/receive-bridge-post'),
  bridgeOpenings = []
;

wlog.add(wlog.transports.File, { filename: 'logs/winstonlog.log'});

var server = new Hapi.Server();
server.connection({ port: 80 });
var io     = require('socket.io')(server.listener);

var bridgeStatuses = {
  "cuevas crossing": {
    status: false
  },
  hawthorne: {
    status: false
  },
  broadway: {
    status: false
  },
  burnside: {
    status: false
  },
  morrison: {
    status: false
  },
};

var bridgeEventSocket = io.on('connection', function (socket) {
  socket.emit('bridge data', bridgeStatuses);
})

server.views({
  engines: {
    html: require('handlebars')
  },
  path: Path.join(__dirname, 'public/templates')
});

server.route({
  method: 'GET',
  path: '/',
  handler: {
    view: "index"
  }
});

server.route({
  method: 'GET',
  path: '/public/{path*}',
  handler: {
    directory: {
      path: Path.join(__dirname, '/public'),
      listing: false,
      index: false
    }
  }
});

// server.route({
//   method: 'GET',
//   path: '/events',
//   handler: {
//     view: "events"
//   }
// });

server.route({
  method: 'POST',
  path: '/incoming-snmp',
  config: {
// TODO: validate payload
    handler: receivePost,
    payload: {
      output: 'stream',
      parse: true
    }
  }
})

server.start(function(){
  console.log('Server running at:', server.info.uri);
});
