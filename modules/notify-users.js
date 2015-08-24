var wlog = require('winston');
var util = require('util');

module .exports = function notifyUsers(request, bridgeStatuses, bridgeEventSocket) {
  var bridgeStatus = request.payload;
  var bridge = bridgeStatus.bridge;
  wlog.info("bridge: " + bridge);
  wlog.info("timestamp: " + new Date(bridgeStatus.timeStamp).toString());
  wlog.info("status: " + bridgeStatus.status);
  bridgeStatuses[bridge] = {
    status: bridgeStatus.status
  };
  wlog.info(util.inspect(bridgeStatuses));
  bridgeEventSocket.emit('bridge data', bridgeStatuses);
};
