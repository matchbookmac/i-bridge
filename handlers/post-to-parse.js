var request  = require('request');
var _        = require('lodash');
var strftime = require('strftime');
var strftimePDT = strftime.timezone(-420);

exports = module.exports = function (config, logger) {
  var postToParse = function (bridgeStatuses) {
    var changedBridge = bridgeStatuses.changed.bridge;
    var changedItem = bridgeStatuses.changed.item;
    var alert, status, alertDate;
    if (changedItem === 'status') {
      if (bridgeStatuses[changedBridge].status) {
        status = ': lift started.';
      } else {
        status = ': lift complete.';
      }
      alert = _.startCase(changedBridge) + status;
    } else {
      alertDate = new Date(_.last(bridgeStatuses[changedBridge].scheduledLifts).estimatedLiftTime);
      alert = _.startCase(changedBridge)+ ': lift scheduled for ' + strftimePDT('%b %e, %Y at %I:%M %p', alertDate);
    }
    var data = JSON.stringify({
      "channels": [
        _.capitalize(_.camelCase(changedBridge))
      ],
      "data": {
        "alert": alert,
        "sound": "default"
      }
    });
    var options = config.parse;
    options.form = data;

    function callback(error, response, body) {
      if (!error && response.statusCode == 200) {
        var info = JSON.parse(body);
        logger.info('Parse notification:', info, response.statusCode);
      } else if (error) {
        logger.error("problem sending notification to Parse", error);
      } else {
        logger.info('Parse notification:', body, response.statusCode);
      }

    }

    request.post(options, callback);
  };
  return postToParse;
};

exports['@singleton'] = true;
exports['@require'] = [ 'config', 'logger' ];
