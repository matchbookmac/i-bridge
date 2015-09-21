var              _ = require('lodash');
var boom           = require('boom');
var db             = require('../models/index');
var Bridge         = db.bridge;
var ScheduledEvent = db.scheduledEvent;
var logger         = require('../config/logging');

module.exports = function (request, reply) {
  var limit = parseInt(request.params.limit);

  require('../modules/find-bridge')(request, findScheduledEvents);

  function findScheduledEvents(err, bridge) {
    if (err) return errorResponse(err);
    var params = {
      order: 'estimatedLiftTime DESC',
      where: {
        bridgeId: bridge.id
      }
    };
    if (limit) params.limit = limit;
    ScheduledEvent.findAll(params)
      .then(function (rows) {
        var response = reply(rows);
        response.header('Access-Control-Allow-Origin', '*');
      })
      .catch(errorResponse);
  }
  function errorResponse(err) {
    reply(boom.badRequest(err));
    logger.error('There was an error finding events for '+ request.params.bridge +': '+ err);
  }
};
