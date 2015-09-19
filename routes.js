var path                = require('path');
var wlog                = require('winston');
var joi                 = require('joi');
var notifyUsers         = require('./handlers/notify-users');
var getBridgesScheduled = require('./handlers/get-bridges-scheduled');

module.exports = function (eventEmitters) {
  var routes = [
    {
      method: 'GET',
      path: '/bridges/sse',
      config: {
        handler: function (request, response) {
          require('./handlers/get-sse')(request, response, eventEmitters);
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
          payload: joi.object({
            changed: joi.object({
              item: joi.string().required(),
              bridge: joi.string().required()
            })
          }).min(1)
            .pattern(/\w+/, joi.object({
              "status": joi.boolean().required(),
              "scheduledLift": joi.alternatives().try(
                null,
                joi.object({
                  type: joi.string(),
                  requestTime: joi.date().required(),
                  estimatedLiftTime: joi.date().required()
                })
              )
            }))
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
      handler: require('./handlers/get-bridges'),
      config: {
        description: 'Array of all bridges',
        notes: 'Derived from unique entries for bridge name in bridge events',
        tags: ['api', 'json']
      }
    },

    {
      method: 'GET',
      path: '/bridges/events',
      handler: require('./handlers/get-all-events'),
      config: {
        description: 'Lists all events, both scheduled and actual',
        notes: 'An object with the keys: bridgeEvents and scheduledEvents, their values are what is generated from /bridges/events/actual, and /bridge/events/scheduled',
        tags: ['api']
      }
    },

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
      handler: require('./handlers/get-bridges-actual'),
      config: {
        description: 'Lists actual bridge lift events in a fancy view',
        notes: 'Array of objects with the keys `bridge`, `upTime`, and `downTime`',
        tags: ['api']
      }
    },

    {
      method: 'GET',
      path: '/bridges/events/actual/{limit*}',
      handler: require('./handlers/get-bridges-actual'),
      config: {
        description: 'Lists actual bridge lift events in json',
        notes: 'Array of objects with the keys `bridge`, `upTime`, and `downTime`',
        tags: ['api', 'json']
      }
    },

    {
      method: 'GET',
      path: '/bridges/{bridge}/events',
      handler: require('./handlers/get-bridge-events'),
      config: {
        description: 'Lists all events, both scheduled and actual for a given bridge',
        notes: 'An object with the keys: bridgeEvents and scheduledEvents, their values are what is generated returned',
        tags: ['api']
      }
    },

    {
      method: 'GET',
      path: '/bridges/{bridge}/events/actual/{limit*}',
      handler: require('./handlers/get-bridge-actual'),
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
      handler: require('./handlers/get-bridges-scheduled'),
      config: {
        // auth: 'simple',
        description: 'Lists scheduled bridge lift events from l-bridge in fancy view',
        notes: 'Array of objects with the keys `bridge`, `type`, `requestTime`, and `estimatedLiftTime`',
        tags: ['api']
      }
    },

    {
      method: 'GET',
      path: '/bridges/events/scheduled/{limit*}',
      handler: require('./handlers/get-bridges-scheduled'),
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
      handler: require('./handlers/get-bridge-scheduled'),
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
