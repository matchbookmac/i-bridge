var db             = require('../models/index');
var ScheduledEvent = db.scheduledEvent;

exports = module.exports = function (logger) {
  var getBridgesScheduled = function (request, reply) {
    var limit = parseInt(request.params.limit);
    var params = { order: 'estimatedLiftTime DESC' };
    if (limit) params.limit = limit;
    params = require('../modules/create-date-params')(params, request);
    ScheduledEvent.findAll(params)
      .then(function (rows) {
        var response = reply(rows);
      })
      .catch(function (err) {
        reply(err);
        logger.error('There was an error finding scheduled events: ' + err);
      });
  };
  return getBridgesScheduled;
};

exports['@singleton'] = true;
exports['@require'] = [ 'logger' ];
