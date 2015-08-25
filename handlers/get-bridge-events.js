var db             = require('../models/index');
var BridgeEvent    = db.BridgeEvent;
var wlog           = require('winston');

module.exports = function (request, reply) {
  var getEventsSQL    = 'SELECT bridge_name, up_time, down_time FROM bridge_events ORDER BY up_time;';
  BridgeEvent.findAll({ order: 'up_time DESC'})
              .then(function (rows) {
                reply(rows);
              })
              .catch(function (err) {
                reply(err);
                wlog.error('There was an error finding bridge events: ' + err);
              });
};
