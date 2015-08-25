var strftime       = require('strftime');
var db             = require('../models/index');
var BridgeEvent    = db.BridgeEvent;
var wlog           = require('winston');

module .exports = function receiveActualPost(request, reply, bridgeOpenings) {
  var bridgeStatus = request.payload;
  var bridgeName = bridgeStatus.bridge.replace(/\'/g, "");
  var timeStamp  = strftime("%Y/%m/%d %H:%M:%S", bridgeStatus.timeStamp);
  if (bridgeStatus.status){
    wlog.info("(true) bridgeStatus.status = " + bridgeStatus.status);

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
console.log('boop');
        BridgeEvent.create({ name: bridgeName, up_time: bridgeOpenings[i].uptime, down_time: timeStamp });
        bridgeOpenings.splice(i, 1);
      }
    }
  }
  reply("post received");
};
