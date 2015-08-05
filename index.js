var Hapi = require('hapi');
var http = require('http');
var Path = require('path');

var currentMessage = {};

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
  path: '/current-message',
  handler: function (request, reply) {
    reply(currentMessage);
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
        currentMessage = JSON.parse(body);
        console.log(currentMessage);
      });

      // currentMessage = request.payload
      // console.log(currentMessage);
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
