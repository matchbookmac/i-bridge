var db             = require('../models/index');
var ActualEvent    = db.actualEvent;
var logger         = require('../config/logging');

module.exports = function (request, reply) {
  var limit = parseInt(request.params.limit);
  var params = { order: 'upTime DESC' };
  if (limit) params.limit = limit;
  params = require('../modules/create-date-params')(params, request);
  ActualEvent.findAll(params)
    .then(function (rows) {
      var response = reply(rows);
    })
    .catch(function (err) {
      reply(err);
      logger.error('There was an error finding bridge events: ' + err);
    });
};
