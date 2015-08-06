var
  Hapi     = require('hapi'),
  Path     = require('path')
;

var server = new Hapi.Server();
server.connection({ port: 3002 });
var io     = require('socket.io')(server.listener);

var bridgeStatuses = {
  cuevas: {
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

server.route({
  method: 'POST',
  path: '/incoming-snmp',
  config: {

    handler: function (request, reply) {
      body = "";
      request.payload.on('data', function (chunk) {
        body += chunk;
      });
      request.payload.on('end', function (err) {
        bridgeStatus = JSON.parse(body);
        var bridge = bridgeStatus.bridge;
        bridgeStatuses[bridge] = {
          status: bridgeStatus.status
        }
        console.log(bridgeStatuses);
        bridgeEventSocket.emit('bridge data', bridgeStatuses);
      });

      reply("post received");
    },

    payload: {
      output: 'stream',
      parse: true
    }
  }
})

server.start(function(){
  console.log('Server running at:', server.info.uri);
});
