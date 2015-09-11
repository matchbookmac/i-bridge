var request = require('request');
var wlog = require('winston');
var _ = require('lodash');

module .exports = function (bridgeStatuses) {
  var changedBridge = bridgeStatuses.changed.bridge;
  var changedItem = bridgeStatuses.changed.item;
  var alert, status;
  if (changedItem === 'status') {
    if (bridgeStatuses[changedBridge].status) {
      status = 'started to raise.';
    } else {
      status = 'lowered.';
    }
    alert = _.startCase(changedBridge)+ ' has ' +status;
  } else {
    alert = _.startCase(changedBridge)+ 'is scheduled to lift at ' + bridgeStatuses[changedBridge].scheduledLift.estimatedLiftTime;
  }
  var data = JSON.stringify({
    "channels": [
      _.capitalize(_.camelCase(changedBridge))
    ],
    "data": {
      "alert": alert
    }
  });
  console.log(data);
  var options = {
    uri: 'https://api.parse.com/1/push',
    headers: {
      'X-Parse-Application-Id': '3auqJUgZz2edaX8bUDrB1TRoUaVxPaWZ4gSAFzYq',
      'X-Parse-REST-API-Key': '3MRH51tSlpsIcfUB2sFuS6o8YLaTSCJuX8NHtl2P',
      'Content-Type': 'application/json'
    },
    form: data
  };

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
