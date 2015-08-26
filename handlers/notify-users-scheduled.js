var wlog = require('winston');
var util = require('util');

module .exports = function notifyUsersScheduled(request, bridgeEventSocket) {
  var scheduledEvent = request.payload;
  var bridge = scheduledEvent.bridge.replace(/\'/g, "");
  scheduledEvent.bridge = bridge;
  wlog.info("bridge: " + bridge + " " + "scheduled to lift at " + scheduledEvent.estimatedLiftTime);
  bridgeEventSocket.emit('scheduled event', scheduledEvent);
};
