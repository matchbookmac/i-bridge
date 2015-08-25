var strftime       = require('strftime');
var boom           = require('boom');
var BridgeEvent    = require('../models/index').BridgeEvent;
var wlog           = require('winston');

module .exports = function receiveBridgeEvent(request, reply, bridgeOpenings) {
  var bridgeStatus = request.payload;
  var bridgeName = bridgeStatus.bridge.replace(/\'/g, "");
  var timeStamp  = strftime("%Y/%m/%d %H:%M:%S", bridgeStatus.timeStamp);
  if (bridgeStatus.status){
    wlog.info("(true) bridgeStatus.status = " + bridgeStatus.status);
    reply("event up post received");
    var bridgeEvent = {
      name: bridgeName,
      uptime: timeStamp
    };
    //check to see if there are any unclosed bridge openings, if so then delete them and replace with this new bridge opening
    for (i = 0; i < bridgeOpenings.length; i++){
      if(bridgeOpenings[i].name === bridgeName){
        bridgeOpenings.splice(i, 1);
      }
    }
    bridgeOpenings.push(bridgeEvent);
  } else {
    wlog.info("(false) bridgeStatus.status = " + bridgeStatus.status);
    for (i = 0; i < bridgeOpenings.length; i++){
      //check to see if there are any open bridge events that correspond with this close event
      if (bridgeOpenings[i].name === bridgeName){
        BridgeEvent.create({ bridge: bridgeName, up_time: bridgeOpenings[i].uptime, down_time: timeStamp })
                    .then(successResponse)
                    .catch(errorResponse);
        bridgeOpenings.splice(i, 1);
      }
    }
  }
  function successResponse(event) {
    reply("event down post received");
  }

  function errorResponse(err) {
    reply(boom.badRequest("There was an error with your event post: " + err));
  }
};
