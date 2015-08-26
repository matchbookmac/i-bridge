var Path           = require('path');
var wlog           = require('winston');
var joi            = require('joi');
var bridgeStatuses = require('./config/config').bridges;
var pre1           = require('./handlers/get-bridge-events');
var bridgeOpenings = [];
var notifyUsersBridge  = require('./handlers/notify-users-bridge');
var receiveBridgeEvent = require('./handlers/receive-bridge-event');
var notifyUsersScheduled  = require('./handlers/notify-users-scheduled');
var receiveScheduledEvent = require('./handlers/receive-scheduled-event');

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
          notifyUsersBridge(request, bridgeStatuses, bridgeEventSocket);
          receiveBridgeEvent(request, reply, bridgeOpenings);
        },
        validate: {
          payload: joi.object().keys({
            "bridge": joi.string().required(),
            "status": joi.boolean().required(),
            "timeStamp": joi.date().required()
          }),
        },
        auth: 'simple'
      }
    },

    {
      method: 'GET',
      path: '/events2',
      config: {
        pre:[{method: pre1, assign: 'data'}],
        handler: function(request, reply) {
          reply.view('events2', {bridgeEvents: request.pre.data});
        }
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
          notifyUsersScheduled(request, bridgeEventSocket);
          receiveScheduledEvent(request, reply);
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

  return routes;
};
