var Path           = require('path');
var wlog           = require('winston');
var strftime       = require('strftime');
var joi            = require('joi');
var notifyUsers    = require('./modules/notify-users');
var bridgeStatuses = require('./config/config').bridges;
var mySQLCred      = require('./config/config').mySQL;
var pre1           = require('./modules/get-bridge-events.js');
var bridgeOpenings = [];

module.exports = function (bridgeEventSocket) {
  var routes = [
    {
      method: 'GET',
      path: '/',
      config: {
        handler: {
          view: "index"
        }
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
      path: '/bridges/events/actual',
      config: {
        pre:[{method: pre1, assign: 'data'}],
        handler: function(request, reply) {
          reply.view('events', {bridgeEvents: request.pre.data});
        }
      }
    },

    {
      method: 'POST',
      path: '/bridges/events/actual',
      config: {
        handler: function (request, reply) {
          notifyUsers(request, bridgeStatuses, bridgeEventSocket);
          receiveActualPost(request, reply, bridgeOpenings);
        },
        validate: {
          payload: joi.object().keys({
            "bridge": joi.string().required(),
            "status": joi.boolean().required(),
            "timeStamp": joi.date().required()
          }),
        }
        // ,
        // auth: 'simple'
      }
    },

    {
      method: 'GET',
      path: '/bridges/events/scheduled',
      config: {
        handler: function(request, reply) {
          reply('scheduled events coming soon!');
        },
        auth: 'simple'
      }
    },

    {
      method: 'POST',
      path: '/bridges/events/scheduled',
      config: {
        handler: function (request, reply) {
          reply('thanks! but we aren\'t accepting scheduled events yet');
        },
        validate: {
          payload: joi.object().keys({
            "bridge": joi.string().required(),
            "type": joi.string().required(),
            "requestTime": joi.date().required(),
            "estimatedLiftTime": joi.date().required()
          }),
        },
        auth: 'simple'
      }
    }
  ];


  function receiveActualPost(request, reply, bridgeOpenings) {
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
          // TODO use sequelize to make new event
          // TODO These are global????
          // upTime = bridgeOpenings[i].uptime;
          // downTime = timeStamp;
          // //build sql string
          // var sql = 'INSERT INTO bridge_events (bridge_name, up_time, down_time) VALUES (' + "'" + bridgeName + "'" + ', ' + "'" + upTime + "'" + ', ' + "'" + downTime + "'" + ');';
          // connection.query(sql, logConnectionErr);
          bridgeOpenings.splice(i, 1);
        }
      }
    }
    reply("post received");
  }

  function logConnectionErr(err){
    wlog.info("SQL Error when inserting new event:  " + err);
  }

  return routes;
};
