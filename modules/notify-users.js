var wlog = require('winston');
var util = require('util');

module .exports = function notifyUsers(request, bridgeStatuses, bridgeEventSocket) {
  var bridgeStatus = request.payload;
  var bridge = bridgeStatus.bridge;
  bridgeStatuses[bridge] = {
    status: bridgeStatus.status
  };
  wlog.info("bridge: " + bridge + " " + util.inspect(bridgeStatuses[bridge]) + " at " + new Date(bridgeStatus.timeStamp).toString());
  bridgeEventSocket.emit('bridge data', bridgeStatuses);
};
