var db             = require('../models/index');
var ScheduledEvent = db.ScheduledEvent;
var wlog           = require('winston');

module.exports = function (request, reply) {
  var limit = parseInt(request.params.limit);
  var params = {
    order: 'estimatedLiftTime DESC'
  };
  if (limit) params.limit = limit;
  ScheduledEvent.findAll(params)
              .then(function (rows) {
                var response = reply(rows);
                response.header('Access-Control-Allow-Origin', '*');
              })
              .catch(function (err) {
                reply(err);
                wlog.error('There was an error finding scheduled events: ' + err);
              });
};
