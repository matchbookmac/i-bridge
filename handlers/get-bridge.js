var _              = require('lodash');
var db             = require('../models/index');
var Bridge         = db.bridge;
var logger         = require('../config/logging');

module.exports = function (request, reply) {
  var bridge = '%';
  _.forIn(request.params.bridge.split(/[\W\d]+/), function (bridgeName) {
    bridge += (bridgeName+'%');
  });
  Bridge.findOne({
    where: {
      name: {
        $like: bridge
      }
    }
  }).then(function (bridge) {
    var response = reply({
      name: bridge.name,
      id: bridge.id,
      totalUpTime: bridge.totalUpTime,
      avgUpTime: bridge.avgUpTime,
      actualCount: bridge.actualCount,
      scheduledCount: bridge.scheduledCount
    });
    response.header('Access-Control-Allow-Origin', '*');
  }).catch(function (err) {
    reply(err);
    logger.error('There was an error finding bridge: ' + err);
  });
};
