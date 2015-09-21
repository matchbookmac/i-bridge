var              _ = require('lodash');
var db             = require('../models/index');
var Bridge         = db.bridge;
var ActualEvent    = db.actualEvent;
var ScheduledEvent = db.scheduledEvent;
var Promise        = require("bluebird");
var logger         = require('../config/logging');

module.exports = function (request, reply) {
  var limit = parseInt(request.params.limit);
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
  }).then(findEvents).catch(errorResponse);
  function findEvents(bridge) {
    var actualParams = {
      order: 'upTime DESC',
      where: {
        bridgeId: bridge.id
      }
    };
    var scheduledParams = {
      order: 'estimatedLiftTime DESC',
      where: {
        bridgeId: bridge.id
      }
    };
    if (limit) params.limit = limit;
    Promise.all([
      ActualEvent.findAll(actualParams),
      ScheduledEvent.findAll(scheduledParams)
    ]).then(function (results) {
      var response = reply({
        bridgeEvents: results[0],
        scheduledEvents: results[1]
      });
      response.header('Access-Control-Allow-Origin', '*');
    }).catch(errorResponse);
  }
  function errorResponse(err) {
    reply(boom.badRequest(err));
    logger.error('There was an error finding events for %s: %s', request.params.bridge, err);
  }
};
