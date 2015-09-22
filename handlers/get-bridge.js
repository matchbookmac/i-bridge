var logger = require('../config/logging');

module.exports = function (request, reply) {
  require('../modules/find-bridge')(request, function (err, bridge) {
    if (err) {
      reply(err);
      return logger.error('There was an error finding bridge: ' + err);
    }
    var response = reply({
      name: bridge.name,
      id: bridge.id,
      totalUpTime: bridge.totalUpTime,
      avgUpTime: bridge.avgUpTime,
      actualCount: bridge.actualCount,
      scheduledCount: bridge.scheduledCount
    });
  });
};
