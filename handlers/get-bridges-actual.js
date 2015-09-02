var db             = require('../models/index');
var BridgeEvent    = db.BridgeEvent;
var wlog           = require('winston');

module.exports = function (request, reply) {
  var limit = parseInt(request.params.limit);
  var params = {
    order: 'up_time DESC'
  };
  if (limit) params.limit = limit;
  BridgeEvent.findAll(params)
              .then(function (rows) {
                var response = reply(rows);
                response.header('Access-Control-Allow-Origin', '*');
              })
              .catch(function (err) {
                reply(err);
                wlog.error('There was an error finding bridge events: ' + err);
              });
};
