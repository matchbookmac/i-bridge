var _              = require('lodash');

module.exports = function createDateParams(params, request) {
  if (!params) params = {};
  var filter = _.remove(request.path.replace("/bridges/events/actual", "").split("/"), function (elem) {
    return elem !== "";
  });
  var date = new Date(request.params.date);
  var startDate = new Date(request.params.startDate);
  var endDate = new Date(request.params.endDate);
  switch (filter[0]) {
    case "before":
      params.where = {
        upTime: {
          $lt: date
        }
      };
      break;
    case "after":
      params.where = {
        upTime: {
          $gt: date
        }
      };
      break;
    case "between":
      params.where = {
        upTime: {
          $between: [startDate, endDate]
        }
      };
      break;
    default:
  }
  return params;
};
