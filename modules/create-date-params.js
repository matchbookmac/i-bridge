var _              = require('lodash');

module.exports = function createDateParams(params, request) {
  if (!params) params = {};
  // RegEx pattern: http://regexr.com/3br9n
  var filter = request.path.match(/(events|actual|scheduled)\/(before|after|between).+/);
  if (filter) {
    filter = _.remove(filter[0].split("/"));
    var date = new Date(request.params.date);
    var startDate = new Date(request.params.startDate);
    var endDate = new Date(request.params.endDate);
    var parameterName;
    if (filter[0] == 'actual' || (filter[0] == 'events' && params.order.includes('upTime'))) {
      params.where = params.where || { upTime: {} };
      parameterName = 'upTime';
    } else if (filter[0] == 'scheduled' || (filter[0] == 'events' && params.order.includes('estimatedLiftTime'))) {
      params.where = params.where || { requestTime: {} };
      parameterName = 'requestTime';
    }
    switch (filter[1]) {
      case "before":
        params.where[parameterName] = { $lt: date };
        break;
      case "after":
        params.where[parameterName] = { $gt: date };
        break;
      case "between":
        params.where[parameterName] = { $between: [startDate, endDate] };
        break;
      default:
    }
  }
  return params;
};
