var Path           = require('path');
var wlog           = require('winston');
var joi            = require('joi');
var bridgeStatuses = require('./config/config').bridges;
var bridgeOpenings = [];
var getBridges = require('./handlers/get-bridges');
var notifyUsers = require('./handlers/notify-users');
var getAllEvents = require('./handlers/get-all-events');
var getBridgeEvents = require('./handlers/get-bridge-events');
var getScheduledEvents = require('./handlers/get-scheduled-events');
var receiveBridgeEvent = require('./handlers/receive-bridge-event');
var receiveScheduledEvent = require('./handlers/receive-scheduled-event');

module.exports = function (bridgeEventSocket) {
  var routes = [
    {
      method: 'GET',
      path: '/',
      config: {
        handler: {
          view: "index"
        },
        description: 'Renders page for the user to watch real-time bridge lifts.',
        tags: ['notification']
      }
    },

    {
      method: 'GET',
      path: '/mobile',
      config: {
        handler: {
          view: "mobile-index"
        },
        description: 'Renders page for the user to watch real-time bridge lifts.',
        tags: ['notification']
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
      path: '/bridges',
      config: {
        pre: [{ method: getBridges, assign: 'data' }],
        handler: function (request, reply) {
          reply.view('bridges', { bridges: request.pre.data });
        },
        description: 'Lists all bridges',
        notes: 'Derived from unique entries for bridge name in bridge events',
        tags: ['api']
      }
    },

    {
      method: 'GET',
      path: '/bridges/events',
      config: {
        pre: [{ method: getAllEvents, assign: 'data' }],
        handler: function (request, reply) {
          reply.view('all-events', { events: request.pre.data });
        },
        description: 'Lists all events, both scheduled and actual',
        notes: 'An object with the keys: bridgeEvents and scheduledEvents, their values are what is generated from /bridges/events/actual, and /bridge/events/scheduled',
        tags: ['api']
      }
    },

    {
      method: 'GET',
      path: '/bridges/events/actual',
      config: {
        pre:[{ method: getBridgeEvents, assign: 'data' }],
        handler: function(request, reply) {
          reply.view('events', { bridgeEvents: request.pre.data });
        },
        description: 'Lists actual bridge lift events',
        notes: 'Array of objects with the keys `bridge`, `upTime`, and `downTime`',
        tags: ['api']
      }
    },

    {
      method: 'POST',
      path: '/bridges/events/actual',
      config: {
        handler: function (request, reply) {
          notifyUsers(request, bridgeStatuses, bridgeEventSocket);
          receiveBridgeEvent(request, reply, bridgeOpenings);
        },
        validate: {
          payload: joi.object().keys({
            "bridge": joi.string().required(),
            "status": joi.boolean().required(),
            "timeStamp": joi.date().required()
          }),
        },
        auth: 'simple',
        description: 'Receives actual bridge lift events from l-bridge. Stores payload in database, and notifies users of a lift event',
        notes: 'Requires an object with the keys `bridge`, `status`, and `timeStamp` that are a string, boolean, and date respectively',
        tags: ['api', 'secure', 'notification']
      }
    },

    {
      method: 'GET',
      path: '/bridges/events/scheduled',
      config: {
        pre:[{ method: getScheduledEvents, assign: 'data' }],
        handler: function(request, reply) {
          reply.view('scheduled', { scheduledEvents: request.pre.data });
        },
        auth: 'simple',
        description: 'Lists scheduled bridge lift events from l-bridge',
        notes: 'Array of objects with the keys `bridge`, `type`, `requestTime`, and `estimatedLiftTime`',
        tags: ['api', 'secure']
      }
    },

    {
      method: 'POST',
      path: '/bridges/events/scheduled',
      config: {
        handler: function (request, reply) {
          notifyUsers(request, bridgeStatuses, bridgeEventSocket);
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
        auth: 'simple',
        description: 'Receives scheduled bridge lift events from multco.us. Stores payload in database, and notifies users of a scheduled lift event',
        notes: 'Requires an object with the keys `bridge`, `type`, `requestTime`, and `estimatedLiftTime` that are a string, string, date, and date respectively',
        tags: ['api', 'secure', 'notification']
      }
    },

    {
      method: 'GET',
      path: '/events2',
      config: {
        pre:[{ method: getScheduledEvents, assign: 'data' }],
        handler: function(request, reply) {
          reply.view('events2', { bridgeEvents: request.pre.data });
        }
      }
    },
  ];

  return routes;
};
