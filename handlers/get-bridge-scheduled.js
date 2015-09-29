var _ = require('lodash');

exports = module.exports = function (logger, db, findBridge, createDateParams) {
  var Bridge         = db.bridge;
  var ScheduledEvent = db.scheduledEvent;
  var getBridgeScheduled = function (request, next) {
    var limit = parseInt(request.params.limit);

    findBridge(request.params.bridge, findScheduledEvents);

    function findScheduledEvents(err, bridge) {
      if (err) return errorResponse(err);
      var params = {
        order: 'estimatedLiftTime DESC',
        where: {
          bridgeId: bridge.id
        }
      };
      if (limit) params.limit = limit;
      params = createDateParams(params, request);
      ScheduledEvent.findAll(params)
        .then(function (rows) {
          var response = next(null, rows);
        })
        .catch(errorResponse);
    }
    function errorResponse(err) {
      next(err, null);
      logger.error('There was an error finding events for '+ request.params.bridge +': '+ err);
    }
  };
  return getBridgeScheduled;
};

exports['@singleton'] = true;
exports['@require'] = [ 'logger', 'database', 'find-bridge', 'create-date-params' ];
