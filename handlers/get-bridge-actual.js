var _ = require('lodash');

exports = module.exports = function (logger, db) {
  var Bridge         = db.bridge;
  var ActualEvent    = db.actualEvent;
  var getBridgeActual = function (params, next) {
    limit = parseInt(params.limit);

    require('../modules/find-bridge')(params.bridge, findActualEvents);

    function findActualEvents(err, bridge) {
      if (err) return errorResponse(err);
      var queryParams = {
        order: 'upTime DESC',
        where: {
          bridgeId: bridge.id
        }
      };
      if (limit) queryParams.limit = limit;
      params = require('../modules/create-date-params')(queryParams, params);
      ActualEvent.findAll(queryParams)
        .then(function (rows) {
          next(null, rows);
        })
        .catch(errorResponse);
    }

    function errorResponse(err) {
      next(err, null);
      logger.error('There was an error finding events for %s: %s', params.bridge, err);
    }
  };
  return getBridgeActual;
};

exports['@singleton'] = true;
exports['@require'] = [ 'logger', 'database' ];
