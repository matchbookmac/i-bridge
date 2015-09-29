exports = module.exports = function (logger, db, createDateParams) {
  var ScheduledEvent = db.scheduledEvent;
  var getBridgesScheduled = function (request, next) {
    var limit = parseInt(request.params.limit);
    var params = { order: 'estimatedLiftTime DESC' };
    if (limit) params.limit = limit;
    params = createDateParams(params, request);
    ScheduledEvent.findAll(params)
      .then(function (rows) {
        next(null, rows);
      })
      .catch(function (err) {
        next(err, null);
        logger.error('There was an error finding scheduled events: ' + err);
      });
  };
  return getBridgesScheduled;
};

exports['@singleton'] = true;
exports['@require'] = [ 'logger', 'database', 'create-date-params' ];
