var _ = require('lodash');

exports = module.exports = function (logger, db, findBridge, createDateParams) {
  var Bridge         = db.bridge;
  var ActualEvent    = db.actualEvent;
  var getBridgeActual = function (request, next) {
    limit = parseInt(request.params.limit);

    findBridge(request.params.bridge, findActualEvents);

    function findActualEvents(err, bridge) {
      if (err) return errorResponse(err);
      var queryParams = {
        order: 'upTime DESC',
        where: {
          bridgeId: bridge.id
        }
      };
      if (limit) queryParams.limit = limit;
      queryParams = createDateParams(queryParams, request);
      ActualEvent.findAll(queryParams)
        .then(function (rows) {
          next(null, rows);
        })
        .catch(errorResponse);
    }

    function errorResponse(err) {
      next(err, null);
      logger.error('There was an error finding events for %s: %s', request.params.bridge, err);
    }
  };
  return getBridgeActual;
};

exports['@singleton'] = true;
exports['@require'] = [ 'logger', 'database', 'find-bridge', 'create-date-params' ];
