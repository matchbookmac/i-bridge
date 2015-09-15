var serverConfig = require('../config/config');

module.exports = function (request, reply, eventEmitters) {
  var bridgeStatuses = serverConfig.bridges;
  var response = reply(eventEmitters.bridgeSSE);
  response.code(200)
          .type('text/event-stream')
          .header('Connection', 'keep-alive')
          .header('Cache-Control', 'no-cache')
          .header('Content-Encoding', 'identity')
          .header('Access-Control-Allow-Origin', '*');

  setTimeout(function () {
    eventEmitters.bridgeSSE.write('event: bridge data\ndata: ' + JSON.stringify(bridgeStatuses) + '\n\nretry: 1000\n');
  }, 1000);

  var interval = setInterval(function () {
    eventEmitters.bridgeSSE.write(': stay-alive\n\n');
  }, 20000);
  request.once('disconnect', function () {
    clearInterval(interval);
  });
};
