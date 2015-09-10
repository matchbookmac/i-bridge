var wlog = require('winston');
var util = require('util');
var serverConfig = require('../config/config');

module .exports = function notifyUsers(request, eventEmitters) {
  var bridgeStatuses = serverConfig.bridges = request.payload;
  // Websockets endpoint notification
  eventEmitters.bridgeEventSocket.emit('bridge data', bridgeStatuses);
  // server sent events endpoint notification
  eventEmitters.bridgeSSE.write('event: bridge data\n');
  eventEmitters.bridgeSSE.write('data: ' + JSON.stringify(bridgeStatuses) + '\n\n');
};
