var request = require('request');
var wlog = require('winston');
var _ = require('lodash');
var strftime = require('strftime');

module .exports = function (bridgeStatuses) {
  var changedBridge = bridgeStatuses.changed.bridge;
  var changedItem = bridgeStatuses.changed.item;
  var alert, status, alertDate;
  if (changedItem === 'status') {
    if (bridgeStatuses[changedBridge].status) {
      status = ': lift started, traffic blocked.';
    } else {
      status = ': lift complete, open for traffic.';
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
      "alert": alert
    }
  });
  var options = require('../config/config').parse;
  options.form = data;

  function callback(error, response, body) {
    if (!error && response.statusCode == 200) {
      var info = JSON.parse(body);
      wlog.info('Parse notification:', info, response.statusCode);
    } else if (error) {
      wlog.error("problem sending notification to Parse", error);
    } else {
      wlog.info('Parse notification:', body, response.statusCode);
    }

  }

  request.post(options, callback);
};