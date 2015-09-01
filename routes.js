var path               = require('path');
var wlog               = require('winston');
var getBridges         = require('./handlers/get-bridges');
var getBridgeActual    = require('./handlers/get-bridge-actual');
var getBridgesActual    = require('./handlers/get-bridges-actual');
var getAllEvents       = require('./handlers/get-all-events');
var getBridgeScheduled  = require('./handlers/get-bridge-scheduled');
var getBridgesScheduled = require('./handlers/get-bridges-scheduled');

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
        handler: getBridges,
        description: 'Array of all bridges',
        notes: 'Derived from unique entries for bridge name in bridge events',
        tags: ['api', 'json']
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
        tags: ['api', 'view']
      }
    },

    {
      method: 'GET',
      path: '/bridges/events/actual',
      config: {
        pre:[{ method: getBridgesActual, assign: 'data' }],
        handler: function(request, reply) {
          reply.view('events', { bridgeEvents: request.pre.data });
        },
        description: 'Lists actual bridge lift events in a fancy view',
        notes: 'Array of objects with the keys `bridge`, `upTime`, and `downTime`',
        tags: ['api', 'view']
      }
    },

    {
      method: 'GET',
      path: '/bridges/events/actual/{limit*}',
      config: {
        handler: getBridgesActual,
        description: 'Lists actual bridge lift events in json',
        notes: 'Array of objects with the keys `bridge`, `upTime`, and `downTime`',
        tags: ['api', 'json']
      }
    },

    {
      method: 'GET',
      path: '/bridges/{bridge}/events/actual/{limit*}',
      config: {
        handler: getBridgeActual,
        // auth: 'simple',
        description: 'Returns last x lift events for given bridge if limit param is provided. If limit param is not provided, it returns all entries. Non-numbers are ignored',
        notes: 'Authentication is specified by an access token as a query parameter, i.e. `/bridges/events/actual?access_token=1234`.',
        tags: ['api', 'json']
      }
    },

    {
      method: 'GET',
      path: '/bridges/events/scheduled',
      config: {
        pre:[{ method: getBridgesScheduled, assign: 'data' }],
        handler: function(request, reply) {
          reply.view('scheduled', { scheduledEvents: request.pre.data });
        },
        // auth: 'simple',
        description: 'Lists scheduled bridge lift events from l-bridge in fancy view',
        notes: 'Array of objects with the keys `bridge`, `type`, `requestTime`, and `estimatedLiftTime`',
        tags: ['api', 'view']
      }
    },

    {
      method: 'GET',
      path: '/bridges/events/scheduled/{limit*}',
      config: {
        handler: getBridgesScheduled,
        // auth: 'simple',
        description: 'Lists scheduled bridge lift events from l-bridge in json',
        notes: 'Array of objects with the keys `bridge`, `type`, `requestTime`, and `estimatedLiftTime`',
        tags: ['api', 'json']
      }
    },

    {
      method: 'GET',
      path: '/bridges/{bridge}/events/scheduled/{limit*}',
      config: {
        handler: getBridgeScheduled,
        // auth: 'simple',
        description: 'Returns last x scheduled lift events for given bridge if limit param is provided. If limit param is not provided, it returns all entries. Non-numbers are ignored',
        notes: 'Authentication is specified by an access token as a query parameter, i.e. `/bridges/events/actual?access_token=1234`.',
        tags: ['api', 'json']
      }
    }
  ];

  return routes;
})();
