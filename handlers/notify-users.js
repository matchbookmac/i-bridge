var wlog = require('winston');
var util = require('util');

module .exports = function notifyUsers(request, bridgeStatuses, eventEmitters) {
  var event = request.payload;
  var bridge = event.bridge.replace(/\'/g, "");
  // Assemble current status for bridge
  bridgeStatuses[bridge] = {
    status: determineStatus(),
    scheduledLift: determineScheduledLift()
  };
  wlog.info("bridge: %s %s at %s",
    bridge,
    util.inspect(bridgeStatuses[bridge]),
    new Date(event.timeStamp ? event.timeStamp : event.requestTime).toString()
  );
  // Websockets endpoint notification
  eventEmitters.bridgeEventSocket.emit('bridge data', bridgeStatuses);
  // server sent events endpoint notification
  eventEmitters.bridgeSSE.write('event: bridge data\n');
  eventEmitters.bridgeSSE.write('data: ' + JSON.stringify(bridgeStatuses) + '\n\n');

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
