var _ = require('lodash');

exports = module.exports = function (logger, db) {
  var Bridge         = db.bridge;
  var getBridges = function (next) {
    Bridge.findAll({
      where: {
        name: {
          $not: null
        }
      }
    }).then(function (rows) {
      next(null, _.map(rows, function (bridge) {
        return {
          name: bridge.name,
          id: bridge.id,
          totalUpTime: bridge.totalUpTime,
          avgUpTime: bridge.avgUpTime,
          actualCount: bridge.actualCount,
          scheduledCount: bridge.scheduledCount
        };
      }));
    })
    .catch(function (err) {
      next(err, null);
      logger.error('There was an error finding bridges: ' + err);
    });
  };
  return getBridges;
};

exports['@singleton'] = true;
exports['@require'] = [ 'logger', 'database' ];
