var Path           = require('path');
var wlog           = require('winston');
var joi            = require('joi');
var notifyUsers    = require('./modules/notify-users');
var receiveActualPost    = require('./modules/receive-actual-post');
var bridgeStatuses = require('./config/config').bridges;
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

  function logConnectionErr(err){
    wlog.info("SQL Error when inserting new event:  " + err);
  }

  return routes;
};
