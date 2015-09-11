var path                = require('path');
var wlog                = require('winston');
var joi                 = require('joi');
var notifyUsers         = require('./handlers/notify-users');
var getBridges          = require('./handlers/get-bridges');
var getBridgeActual     = require('./handlers/get-bridge-actual');
var getBridgesActual    = require('./handlers/get-bridges-actual');
var getAllEvents        = require('./handlers/get-all-events');
var getBridgeScheduled  = require('./handlers/get-bridge-scheduled');
var getBridgesScheduled = require('./handlers/get-bridges-scheduled');

module.exports = function (eventEmitters) {
  var routes = [
    {
      method: 'GET',
      path: '/sse',
      config: {
        handler: function (request, reply) {
          var response = reply(eventEmitters.bridgeSSE);
          response.code(200)
                  .type('text/event-stream')
                  .header('Connection', 'keep-alive')
                  .header('Cache-Control', 'no-cache')
                  .header('Content-Encoding', 'identity')
                  .header('Access-Control-Allow-Origin', '*');

          setTimeout(function () {
            eventEmitters.bridgeSSE.write('event: bridge data\ndata: ' + JSON.stringify(bridgeStatuses) + '\n\nretry: 1000\n');
          }, 1000);

          var interval = setInterval(function () {
            eventEmitters.bridgeSSE.write(': stay-alive\n\n');
          }, 20000);
          request.once('disconnect', function () {
            clearInterval(interval);
          });
        }
      }
    },

    {
      method: 'POST',
      path: '/bridges/statuses',
      handler: function (request, reply) {
        notifyUsers(request, eventEmitters);
        wlog.info(require('util').inspect(request.payload));
        reply('statuses received');
      },
      config: {
        validate: {
          payload: joi.object()
                      // { changed: joi.string() }
                      // .min(1)
                      // .pattern(/\w+/, joi.object({
                      //   "status": joi.boolean.required(),
                      //   "scheduledLift": joi.any().valid(
                      //     null,
                      //     joi.object({
                      //       "type": joi.string(),
                      //       "estimatedLiftTime": joi.date(),
                      //       "requestTime": joi.date()
                      //     }).and('type', 'estimatedLiftTime', 'requestTime')
                      //   )
                      // }))
        },
        auth: 'simple',
        description: 'Endpoint to receive status updates from a-bridge',
        notes: 'Requires an object with one or more keys, where each key is an object with the keys `status` and `scheduledLift`. `status` is a boolean, and `scheduledLift` is an object with the keys `type`, `estimatedLiftTime`, and `requestTime` Authentication is specified by an access token as a query parameter, i.e. `/bridges/events/actual?access_token=1234`.',
        tags: ['auth', 'notification']
      }
    },

    {
      method: 'GET',
      path: '/bridges',
      handler: getBridges,
      config: {
        description: 'Array of all bridges',
        notes: 'Derived from unique entries for bridge name in bridge events',
        tags: ['api', 'json']
      }
    },

    {
      method: 'GET',
      path: '/bridges/events',
      handler: function (request, reply) {
        reply.view('all-events', { events: request.pre.data });
      },
      config: {
        pre: [{ method: getAllEvents, assign: 'data' }],
        description: 'Lists all events, both scheduled and actual',
        notes: 'An object with the keys: bridgeEvents and scheduledEvents, their values are what is generated from /bridges/events/actual, and /bridge/events/scheduled',
        tags: ['api', 'view']
      }
    },

    // path: '/bridges/{bridge}/events'
    // path: '/bridges/{bridge}/uptime'
    // path: '/bridges/{bridge}/downtime'
    // path: '/bridges/{bridge}/uptime/avg'
    // path: '/bridges/{bridge}/downtime/avg'
    // path: '/bridges/events/actual/before/{date*}',
    // path: '/bridges/events/actual/after/{date*}',
    // path: '/bridges/events/actual/between/{date*}/{date*}',
    // path: '/bridges/events/scheduled/before/{date*}',
    // path: '/bridges/events/scheduled/after/{date*}',
    // path: '/bridges/events/scheduled/between/{date*}/{date*}',
    // path: '/bridges/{bridge}/events/actual/before/{date*}',
    // path: '/bridges/{bridge}/events/actual/after/{date*}',
    // path: '/bridges/{bridge}/events/actual/between/{date*}/{date*}',
    // path: '/bridges/{bridge}/events/scheduled/before/{date*}',
    // path: '/bridges/{bridge}/events/scheduled/after/{date*}',
    // path: '/bridges/{bridge}/events/scheduled/between/{date*}/{date*}',

    {
      method: 'GET',
      path: '/bridges/events/actual',
      handler: function(request, reply) {
        reply.view('events', { bridgeEvents: request.pre.data });
      },
      config: {
        pre:[{ method: getBridgesActual, assign: 'data' }],
        description: 'Lists actual bridge lift events in a fancy view',
        notes: 'Array of objects with the keys `bridge`, `upTime`, and `downTime`',
        tags: ['api', 'view']
      }
    },

    {
      method: 'GET',
      path: '/bridges/events/actual/{limit*}',
      handler: getBridgesActual,
      config: {
        description: 'Lists actual bridge lift events in json',
        notes: 'Array of objects with the keys `bridge`, `upTime`, and `downTime`',
        tags: ['api', 'json']
      }
    },

    {
      method: 'GET',
      path: '/bridges/{bridge}/events/actual/{limit*}',
      handler: getBridgeActual,
      config: {
        // auth: 'simple',
        description: 'Returns last x lift events for given bridge if limit param is provided. If limit param is not provided, it returns all entries. Non-numbers are ignored',
        notes: 'Authentication is specified by an access token as a query parameter, i.e. `/bridges/events/actual?access_token=1234`.',
        tags: ['api', 'json']
      }
    },

    {
      method: 'GET',
      path: '/bridges/events/scheduled',
      handler: function(request, reply) {
        reply.view('scheduled', { scheduledEvents: request.pre.data });
      },
      config: {
        pre:[{ method: getBridgesScheduled, assign: 'data' }],
        // auth: 'simple',
        description: 'Lists scheduled bridge lift events from l-bridge in fancy view',
        notes: 'Array of objects with the keys `bridge`, `type`, `requestTime`, and `estimatedLiftTime`',
        tags: ['api', 'view']
      }
    },

    {
      method: 'GET',
      path: '/bridges/events/scheduled/{limit*}',
      handler: getBridgesScheduled,
      config: {
        // auth: 'simple',
        description: 'Lists scheduled bridge lift events from l-bridge in json',
        notes: 'Array of objects with the keys `bridge`, `type`, `requestTime`, and `estimatedLiftTime`',
        tags: ['api', 'json']
      }
    },

    {
      method: 'GET',
      path: '/bridges/{bridge}/events/scheduled/{limit*}',
      handler: getBridgeScheduled,
      config: {
        // auth: 'simple',
        description: 'Returns last x scheduled lift events for given bridge if limit param is provided. If limit param is not provided, it returns all entries. Non-numbers are ignored',
        notes: 'Authentication is specified by an access token as a query parameter, i.e. `/bridges/events/actual?access_token=1234`.',
        tags: ['api', 'json']
      }
    }
  ];

  return routes;
};
