var              _ = require('lodash');
var boom           = require('boom');
var db             = require('../models/index');
var Bridge         = db.bridge;
var ActualEvent    = db.actualEvent;
var ScheduledEvent = db.scheduledEvent;
var Promise        = require("bluebird");
var logger         = require('../config/logging');

module.exports = function (request, reply) {
  var limit = parseInt(request.params.limit);

  require('../modules/find-bridge')(request, findEvents);

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
    // TODO: this doesn't parse if actual or scheduled is not in the path
    actualParams = require('../modules/create-date-params')(actualParams, request);
    scheduledParams = require('../modules/create-date-params')(scheduledParams, request);

    Promise.all([
      ActualEvent.findAll(actualParams),
      ScheduledEvent.findAll(scheduledParams)
    ]).then(function (results) {
      var response = reply({
        actualEvents: results[0],
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
