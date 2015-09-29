exports = module.exports = function (logger, db, createDateParams) {
  var ActualEvent    = db.actualEvent;
  var getBridgesActual = function (request, next) {
    var limit = parseInt(request.params.limit);
    var params = { order: 'upTime DESC' };
    if (limit) params.limit = limit;
    params = createDateParams(params, request);
    ActualEvent.findAll(params)
      .then(function (rows) {
        var response = next(null, rows);
      })
      .catch(function (err) {
        next(err, null);
        logger.error('There was an error finding bridge events: ' + err);
      });
  };
  return getBridgesActual;
};

exports['@singleton'] = true;
exports['@require'] = [ 'logger', 'database', 'create-date-params' ];
