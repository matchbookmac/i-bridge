var db             = require('../models/index');
var BridgeEvent    = db.BridgeEvent;
var ScheduledEvent = db.ScheduledEvent;
var wlog           = require('winston');

module.exports = function (request, reply) {
  BridgeEvent.findAll({ order: 'up_time DESC'})
              .then(function (events) {
                ScheduledEvent.findAll({ order: 'estimatedLiftTime DESC'})
                            .then(function (scheduled) {
                              reply({
                                bridgeEvents: events,
                                scheduledEvents: scheduled
                              });
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
