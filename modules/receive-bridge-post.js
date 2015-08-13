var
  wlog    = require('winston'),
  mysql   = require('mysql'),
  moment  = require('moment'),
  bridgeOpenings = []
;

module .exports = function receivePost(request, reply) {
  body = "";
  request.payload.on('data', function (chunk) {
    body += chunk;
  });
  request.payload.on('end', function (err) {
    bridgeStatus = JSON.parse(body);
    var bridge = bridgeStatus.bridge;
    console.log("bridge: " + bridge);
    console.log("timestamp: " + bridgeStatus.timeStamp);
    console.log("status: " + bridgeStatus.status);
    bridgeStatuses[bridge] = {
      status: bridgeStatus.status
    };
    console.log(bridgeStatuses);
    bridgeEventSocket.emit('bridge data', bridgeStatuses);
//write data to AWS
    connection = mysql.createConnection({
      host     : 'uatgenrds.clvekbxagtjv.us-west-2.rds.amazonaws.com',
      user     : 'uatbridgeapp',
      password : '2HY4hykACYHmQK8g',
      port     : 3306,
      database : 'uatbridgeapp'
    });
    connection.connect(function(err){
      if (err) {
        wlog.info("MYSQL connection error: " + err.code);
        wlog.info("MYSQL connection error fatal?: " + err.fatal);
      }
      else{
        wlog.info("MYSQL connection: successful. ");
      }
    });
    bridgeName = bridgeStatus.bridge,
    bridgeName = bridgeName.replace(/\'/g, ""),
    timeStamp = moment(bridgeStatus.timeStamp).format("YYYY/MM/DD HH:mm:ss").toString();
    if (!bridgeStatus.status){
      console.log("(false) bridgeStatus.status = " + bridgeStatus.status);
      for (i = 0; i < bridgeOpenings.length; i++){
        //check to see if there are any open bridge events that correspond with this close event

        if (bridgeOpenings[i].name === bridgeName){
          upTime = bridgeOpenings[i].uptime;
          downTime = timeStamp;
          //build sql string
          var sql = 'INSERT INTO bridge_events (bridge_name, up_time, down_time) VALUES (' + "'" + bridgeName + "'" + ', ' + "'" + upTime + "'" + ', ' + "'" + downTime + "'" + ');';
          connection.query(sql, function(err){
            wlog.info("SQL Error when inserting new event:  " + err);
          });
          bridgeOpenings.splice(i, 1);
        }
      }

    } else if (bridgeStatus.status) {
      console.log("(true) bridgeStatus.status = " + bridgeStatus.status);

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
    }
  });

  reply("post received");
};
