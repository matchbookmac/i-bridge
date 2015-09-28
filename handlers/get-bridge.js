var injector   = require('electrolyte');
var findBridge = injector.create('../modules/find-bridge');

exports = module.exports = function (logger) {
  var getBridge = function (bridge, next) {
    findBridge(bridge, function (err, bridge) {
      if (err) {
        next(err, null);
        return logger.error('There was an error finding bridge: ', bridge, err);
      }
      next(null, {
        name: bridge.name,
        id: bridge.id,
        totalUpTime: bridge.totalUpTime,
        avgUpTime: bridge.avgUpTime,
        actualCount: bridge.actualCount,
        scheduledCount: bridge.scheduledCount
      });
    });
  };
  return getBridge;
};

exports['@singleton'] = true;
exports['@require'] = [ 'logger' ];
