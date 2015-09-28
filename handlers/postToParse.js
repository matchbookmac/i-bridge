var request  = require('request');
var logger   = require('../config/logging');
var _        = require('lodash');
var strftime = require('strftime');

module .exports = function (bridgeStatuses) {
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
    alertDate = new Date(bridgeStatuses[changedBridge].scheduledLift.estimatedLiftTime);
    alert = _.startCase(changedBridge)+ ': lift scheduled for ' + strftime('%b %e, %Y at %I:%M %p',alertDate);
  }
  var data = JSON.stringify({
    "channels": [
      _.capitalize(_.camelCase(changedBridge))
    ],
    "data": {
      "alert": alert,
      "sound": ""
    }
  });
  var options = require('../config/config').parse;
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
