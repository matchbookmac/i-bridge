var _              = require('lodash');
var boom           = require('boom');
var db             = require('../models/index');
var Bridge         = db.bridge;
var ActualEvent    = db.actualEvent;
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
  }).then(findActualEvents).catch(errorResponse);
  function findActualEvents(bridge) {
    var params = {
      order: 'upTime DESC',
      where: {
        bridgeId: bridge.id
      }
    };
    if (limit) params.limit = limit;
    ActualEvent.findAll(params)
      .then(function (rows) {
        var response = reply(rows);
        response.header('Access-Control-Allow-Origin', '*');
      })
      .catch(errorResponse);
  }
  function errorResponse(err) {
    reply(boom.badRequest(err));
    logger.error('There was an error finding bridge events for '+ bridge +': '+ err);
  }
};
