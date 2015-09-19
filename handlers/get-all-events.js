var db             = require('../models/index');
var ActualEvent    = db.actualEvent;
var ScheduledEvent = db.scheduledEvent;
var wlog           = require('winston');

module.exports = function (request, reply) {
  ActualEvent.findAll({ order: 'upTime DESC'})
    .then(function (events) {
      ScheduledEvent.findAll({ order: 'estimatedLiftTime DESC'})
        .then(function (scheduled) {
          var response = reply({
            bridgeEvents: events,
            scheduledEvents: scheduled
          });
          response.header('Access-Control-Allow-Origin', '*');
        })
        .catch(function (err) {
          reply(err);
          wlog.error('There was an error finding scheduled events: ' + err);
        });
    })
    .catch(function (err) {
      reply(err);
      wlog.error('There was an error finding bridge events: ' + err);
    });
};
