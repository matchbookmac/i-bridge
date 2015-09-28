var _              = require('lodash');
var db             = require('../models/index');
var Bridge         = db.bridge;

exports = module.exports = function (logger) {
  var getBridges = function (request, reply) {
    Bridge.findAll({
      where: {
        name: {
          $not: null
        }
      }
    }).then(function (rows) {
      var response = reply(_.map(rows, function (bridge) {
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
      reply(err);
      logger.error('There was an error finding bridges: ' + err);
    });
  };
  return getBridges;
};

exports['@singleton'] = true;
exports['@require'] = [ 'logger' ];
