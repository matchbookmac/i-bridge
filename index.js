var
  Hapi    = require('hapi'),
  Path    = require('path'),
  wlog    = require('winston'),
  mysql   = require('mysql'),
  moment  = require('moment'),
  bridgeOpenings = []
;


wlog.add(wlog.transports.File, { filename: 'logs/winstonlog.log'});

var server = new Hapi.Server();
server.connection({ port: 80 });
var io     = require('socket.io')(server.listener);

var bridgeStatuses = {
  "cuevas crossing": {
    status: false
  },
  hawthorne: {
    status: false
  },
  broadway: {
    status: false
  },
  burnside: {
    status: false
  },
  morrison: {
    status: false
  },

};

var bridgeEventSocket = io.on('connection', function (socket) {
  socket.emit('bridge data', bridgeStatuses);
})

server.views({
  engines: {
    html: require('handlebars')
  },
  path: Path.join(__dirname, 'public/templates')
});


server.route({
  method: 'GET',
  path: '/',
  handler: {
    view: "index"
  }
});

server.route({
  method: 'GET',
  path: '/public/{path*}',
  handler: {
    directory: {
      path: Path.join(__dirname, '/public'),
      listing: false,
      index: false
    }
  }
});

server.route({
  method: 'GET',
  path: '/events',
  handler: {
    view: "events"
  }
});

server.route({
  method: 'POST',
  path: '/incoming-snmp',
  config: {
    handler: function (request, reply) {
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
        }
        console.log(bridgeStatuses);
        bridgeEventSocket.emit('bridge data', bridgeStatuses);
//write data to AWS
        connection = mysql.createConnection({
          host     : 'uatgenrds.clvekbxagtjv.us-west-2.rds.amazonaws.com',
          user     : 'uatbridgeapp',
          password : '2HY4hykACYHmQK8g',
          port     : 3306
        })
        connection.connect(function(err){
          if (err) {
            wlog.info("MYSQL connection error: " + err.code)
            wlog.info("MYSQL connection error fatal?: " + err.fatal)
          }
          else{
            wlog.info("MYSQL connection: successful. ")
          }
        });
        bridgeName = bridgeStatus.bridge,
        bridgeName = bridgeName.replace(/\'/g, ""),
        timeStamp = moment(bridgeStatus.timeStamp).format("YYYY/MM/DD HH:mm:ss").toString();
        if (bridgeStatus.status == false){
          console.log("(false) bridgeStatus.status = " + bridgeStatus.status);
          for (i = 0; i < bridgeOpenings.length; i++){
            //check to see if there are any open bridge events that correspond with this close event
            if (bridgeOpenings[i].name = bridgeName){
              upTime = bridgeOpenings[i].uptime;
              downTime = timeStamp;
              //build sql string
              var sql = 'INSERT INTO bridgeEvents (trainName, upTime, downTime) VALUES (' + "'" + bridgeName + "'" + ', ' + "'" + upTime + "'" + ', ' + "'" + downTime + "'" + ');';
              connection.query(sql);
              bridgeOpenings.splice(i, 1);
            }
          }

        } else if (bridgeStatus.status == true) {
          console.log("(true) bridgeStatus.status = " + bridgeStatus.status);

          var bridgeEvent = {
            name: bridgeName,
            uptime: timeStamp
          }
          //check to see if there are any unclosed bridge openings, if so then delete them and replace with this new bridge opening
          for (i = 0; i < bridgeOpenings.length; i++){
            if(bridgeOpenings[i].name = bridgeName){
              bridgeOpenings.splice(i, 1);
            }
          }
          bridgeOpenings.push(bridgeEvent);
        };


      });

      reply("post received");
    },

    payload: {
      output: 'stream',
      parse: true
    }
  }
})

server.start(function(){
  console.log('Server running at:', server.info.uri);
});
