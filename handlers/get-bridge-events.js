var _       = require('lodash');
var Promise = require("bluebird");

exports = module.exports = function (logger, db, findBridge, createDateParams) {
  var Bridge         = db.bridge;
  var ActualEvent    = db.actualEvent;
  var ScheduledEvent = db.scheduledEvent;
  var getBridgeEvents = function (request, next) {
    var limit = parseInt(request.params.limit);

    findBridge(request.params.bridge, findEvents);

    function findEvents(err, bridge) {
      if (err) return errorResponse(err);

      var actualParams = { order: 'upTime DESC' };
      var scheduledParams = { order: 'estimatedLiftTime DESC' };

      if (bridge) {
        scheduledParams.where = { bridgeId: bridge.id };
        actualParams.where = { bridgeId: bridge.id };
      }
      if (limit) {
        actualParams.limit = limit;
        scheduledParams.limit = limit;
      }

      actualParams = createDateParams(actualParams, request);
      scheduledParams = createDateParams(scheduledParams, request);

      Promise.all([
        ActualEvent.findAll(actualParams),
        ScheduledEvent.findAll(scheduledParams)
      ]).then(function (results) {
        next(null, {
          actualEvents: results[0],
          scheduledEvents: results[1]
        });
      }).catch(errorResponse);
    }

    function errorResponse(err) {
      next(err, null);
      logger.error('There was an error finding events for %s: %s', request.params.bridge, err);
    }
  };
  return getBridgeEvents;
};

exports['@singleton'] = true;
exports['@require'] = [ 'logger', 'database', 'find-bridge', 'create-date-params' ];
