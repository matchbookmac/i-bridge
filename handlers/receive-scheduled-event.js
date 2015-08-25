var strftime       = require('strftime');
var boom           = require('boom');
var ScheduledEvent = require('../models/index').ScheduledEvent;
var db = require('../models/index');
var wlog           = require('winston');

module .exports = function receiveScheduledEvent(request, reply) {
  var scheduledEvent = request.payload;
  ScheduledEvent.create(scheduledEvent)
                .then(function (event) {
                  reply("schedule post received");
                })
                .catch(function (err) {
                  reply(boom.badRequest("There was an error with your schedule post: " + err));
                });
};
