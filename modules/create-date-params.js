var _ = require('lodash');

exports = module.exports = function () {
  function createDateParams(queryParams, request) {
    if (!queryParams) queryParams = {};
    // RegEx pattern: http://regexr.com/3br9n
    var filter = request.path.match(/(events|actual|scheduled)\/(before|after|between).+/);
    if (filter) {
      filter = _.remove(filter[0].split("/"));
      var date = new Date(request.params.date);
      var startDate = new Date(request.params.startDate);
      var endDate = new Date(request.params.endDate);
      var parameterName;
      if (filter[0] == 'actual' || (filter[0] == 'events' && queryParams.order.includes('upTime'))) {
        queryParams.where = queryParams.where || { upTime: {} };
        parameterName = 'upTime';
      } else if (filter[0] == 'scheduled' || (filter[0] == 'events' && queryParams.order.includes('estimatedLiftTime'))) {
        queryParams.where = queryParams.where || { requestTime: {} };
        parameterName = 'requestTime';
      }
      switch (filter[1]) {
        case "before":
          queryParams.where[parameterName] = { $lt: date };
          break;
        case "after":
          queryParams.where[parameterName] = { $gt: date };
          break;
        case "between":
          queryParams.where[parameterName] = { $between: [startDate, endDate] };
          break;
        default:
      }
    }
    return queryParams;
  }
  return createDateParams;
};

exports['@singleton'] = true;
exports['@require'] = [];
