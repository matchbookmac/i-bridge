var db             = require('../models/index');
var ActualEvent    = db.actualEvent;
var wlog           = require('winston');

module.exports = function (request, reply) {
  var limit = parseInt(request.params.limit);
  var params = {
    order: 'upTime DESC'
  };
  if (limit) params.limit = limit;
  ActualEvent.findAll(params)
              .then(function (rows) {
                var response = reply(rows);
                response.header('Access-Control-Allow-Origin', '*');
              })
              .catch(function (err) {
                reply(err);
                wlog.error('There was an error finding bridge events: ' + err);
              });
};
