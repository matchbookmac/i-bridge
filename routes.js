var
  Path           = require('path'),
  util           = require('util'),
  wlog           = require('winston'),
  mysql          = require('mysql'),
  strftime       = require('strftime'),
  joi            = require('joi'),
  bridgeStatuses = require('./config/config').bridges,
  mySQLCred      = require('./config/config').mySQL,
  pre1           = require('./modules/get-bridge-events.js'),
  bridgeOpenings = []
;

module.exports = [
  {
    method: 'GET',
    path: '/',
    handler: {
      view: "index"
    }
  },

  {
    method: 'GET',
    path: '/public/{path*}',
    handler: {
      directory: {
        path: Path.join(__dirname, '/public'),
        listing: false,
        index: false
      }
    }
  },

  {
    method: 'GET',
    path: '/events',
    config: {
      pre:[{method: pre1, assign: 'data'}],
      handler: function(request, reply) {
        reply.view('events', {bridgeEvents: request.pre.data});
      }
    }
  },

  {
    method: 'POST',
    path: '/incoming-snmp',
    config: {
      handler: receivePost,
      validate: {
        payload: joi.object().keys({
          "bridge": joi.string().required(),
          "status": joi.boolean().required(),
          "timeStamp": joi.date().required()
        }),
      }
    }
  }
];

function receivePost(request, reply) {
  bridgeStatus = request.payload;
  var bridge = bridgeStatus.bridge;
  wlog.info("bridge: " + bridge);
  wlog.info("timestamp: " + new Date(bridgeStatus.timeStamp).toString());
  wlog.info("status: " + bridgeStatus.status);
  bridgeStatuses[bridge] = {
    status: bridgeStatus.status
  };
  wlog.info(util.inspect(bridgeStatuses));
  bridgeEventSocket.emit('bridge data', bridgeStatuses);

//write data to AWS
  connection = mysql.createConnection({
    host     : mySQLCred.host,
    user     : mySQLCred.user,
    password : mySQLCred.password,
    port     : mySQLCred.port,
    database : mySQLCred.database
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
  bridgeName = bridgeStatus.bridge;
  bridgeName = bridgeName.replace(/\'/g, "");
  timeStamp  = strftime("%Y/%m/%d %H:%M:%S", bridgeStatus.timeStamp);
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
        upTime = bridgeOpenings[i].uptime;
        downTime = timeStamp;
        //build sql string
        var sql = 'INSERT INTO bridge_events (bridge_name, up_time, down_time) VALUES (' + "'" + bridgeName + "'" + ', ' + "'" + upTime + "'" + ', ' + "'" + downTime + "'" + ');';
        connection.query(sql, logConnectionErr);
        bridgeOpenings.splice(i, 1);
      }
    }
  }
  reply("post received");
}

function logConnectionErr(err){
  wlog.info("SQL Error when inserting new event:  " + err);
}
