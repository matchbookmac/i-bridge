var util = require('util');

exports = module.exports = function (serverConfig, postToParse) {
  var notifyUsers = function (bridgeStatuses, eventEmitters) {
    serverConfig.bridges = bridgeStatuses;
    // Websockets endpoint notification
    eventEmitters.bridgeEventSocket.emit('bridge data', bridgeStatuses);
    // server sent events endpoint notification
    eventEmitters.bridgeSSE.write('event: bridge data\n');
    eventEmitters.bridgeSSE.write('data: ' + JSON.stringify(bridgeStatuses) + '\n\n');
    postToParse(bridgeStatuses);
  };
  return notifyUsers;
};

exports['@singleton'] = true;
exports['@require'] = [ 'config', 'post-to-parse' ];
