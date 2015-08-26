var db             = require('../models/index');
var ScheduledEvent = db.ScheduledEvent;
var wlog           = require('winston');

module.exports = function (request, reply) {
  ScheduledEvent.findAll({ order: 'estimatedLiftTime DESC'})
              .then(function (rows) {
                reply(rows);
              })
              .catch(function (err) {
                reply(err);
                wlog.error('There was an error finding scheduled events: ' + err);
              });
};
