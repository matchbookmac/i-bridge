var path               = require('path');
var wlog               = require('winston');
var getBridges         = require('./handlers/get-bridges');
var getAllEvents       = require('./handlers/get-all-events');
var getBridgeEvents    = require('./handlers/get-bridge-events');
var getScheduledEvents = require('./handlers/get-scheduled-events');

module.exports = (function () {
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
      path: '/public/{path*}',
      handler: {
        directory: {
          path: path.join(__dirname, '/public'),
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
    }
  ];

  return routes;
})();
