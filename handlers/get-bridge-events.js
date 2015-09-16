var              _ = require('lodash');
var db             = require('../models/index');
var BridgeEvent    = db.BridgeEvent;
var ScheduledEvent = db.ScheduledEvent;
var wlog           = require('winston');

module.exports = function (request, reply) {
  var limit = parseInt(request.params.limit);
  var bridge = '%';
  _.forIn(request.params.bridge.split(/[\W\d]+/), function (bridgeName) {
    bridge += (bridgeName+'%');
  });
  var actualParams = {
    order: 'up_time DESC',
    where: {
      bridge: {
        $like: bridge
      }
    }
  };
  var scheduledParams = {
    order: 'estimatedLiftTime DESC',
    where: {
      bridge: {
        $like: bridge
      }
    }
  };
  if (limit) params.limit = limit;
  BridgeEvent.findAll(actualParams)
    .then(function (actual) {
      ScheduledEvent.findAll(scheduledParams)
        .then(function (scheduled) {
          var response = reply({
            bridgeEvents: actual,
            scheduledEvents: scheduled
          });
          response.header('Access-Control-Allow-Origin', '*');
        })
        .catch(function (err) {
          reply(err);
          wlog.error('There was an error finding scheduled events for %s: %s', request.params.bridge, err);
        });
    })
    .catch(function (err) {
      reply(err);
      wlog.error('There was an error finding scheduled events for %s: %s', request.params.bridge, err);
    });
};
