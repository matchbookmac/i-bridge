var Hapi = require('hapi');
var http = require('http');
var Path = require('path');

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

var server = new Hapi.Server();
server.connection({ port: 3002 });
server.views({
  engines: {
    html: require('handlebars')
  },
  path: Path.join(__dirname, 'templates')
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
  path: '/bridges',
  handler: function (request, reply) {
    reply(bridgeStatuses);
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
        bridgeStatuses[bridgeStatus.bridge].status = bridgeStatus.status;
        console.log(bridgeStatuses);
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
