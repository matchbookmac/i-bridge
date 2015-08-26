var wlog = require('winston');
var util = require('util');

module .exports = function notifyUsers(request, bridgeStatuses, bridgeEventSocket) {
  var event = request.payload;
  var bridge = event.bridge.replace(/\'/g, "");
  bridgeStatuses[bridge] = {
    status: determineStatus(),
    scheduledLift: determineScheduledLift()
  };
  wlog.info("bridge: " + bridge + " " + util.inspect(bridgeStatuses[bridge]) + " at " + new Date(event.timeStamp ? event.timeStamp : event.requestTime).toString());
  bridgeEventSocket.emit('bridge data', bridgeStatuses);

  function determineStatus() {
    return bridgeStatuses[bridge] ? event.type ? bridgeStatuses[bridge].status
                                               : event.status
                                  : false;
  }
  function determineScheduledLift() {
    return event.type ? event
                      : event.status ? null
                                     : bridgeStatuses[bridge].scheduledLift;
  }
};
