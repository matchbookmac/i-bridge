var path                = require('path');
var joi                 = require('joi');
var boom                = require('boom');
var bridgeOptions = [
  'Hawthorne',
  'hawthorne',
  'Morrison',
  'morrison',
  'Burnside',
  'burnside',
  'Broadway',
  'broadway',
  'Cuevas Crossing',
  'cuevas crossing',
  'bailey\'s bridge',
  'Bailey\'s Bridge',
  'baileys bridge',
  'Baileys Bridge'
];

exports = module.exports = function (logger, handlers) {
  function respond(err, result) {
    if (err) {
      reply(boom.badRequest(err));
    } else {
      reply(result);
    }
  }
  function addRoutes(server) {
    server.route([
      {
        method: 'GET',
        path: '/bridges/sse',
        config: {
          handler: function (request, response) {
            handlers.getSSE(request, response, server.eventEmitters);
          },
          description: 'Server-Sent events outlet',
          notes: 'Follows: https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events.\n Emits an `event: bridge data` when first connected to, and a `bridge data` event when the status of a bridge changes. The `bridge data` event is followed by a `data: {JSON}` line containing the bridge event data. There is a stay-alive event every 20s as: `: stay-alive\n\n`.',
          tags: ['notification']
        }
      },

      {
        method: 'POST',
        path: '/bridges/statuses',
        handler: function (request, reply) {
          logger.info(require('util').inspect(request.payload));
          handlers.notifyUsers(request.payload, server.eventEmitters);
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
                ),
                "lastFive": joi.alternatives().try(
                  null,
                  joi.array().items(joi.object({
                    type: joi.string(),
                    requestTime: joi.date().required(),
                    estimatedLiftTime: joi.date().required()
                  }))
                )
              })),
          },
          cors: false,
          auth: 'simple',
          description: 'Endpoint to receive status updates from a-bridge',
          notes: 'Requires an object with one or more keys, where each key is an object with the keys `status` and `scheduledLift`. `status` is a boolean, and `scheduledLift` is an object with the keys `type`, `estimatedLiftTime`, and `requestTime` Authentication is specified by an access token as a query parameter, i.e. `/bridges/events/actual?access_token=1234`.',
          tags: ['auth', 'notification'],
          plugins: {
            lout: false
          }
        }
      },

      {
        method: 'GET',
        path: '/bridges',
        handler: function (request, reply) {
          server.methods.getBridges(function (err, result) {
            if (err) {
              reply(boom.badRequest(err));
            } else {
              reply(result);
            }
          });
        },
        config: {
          auth: 'simple',
          description: 'Array of all bridges',
          notes: 'Derived from unique entries for bridge name in bridge events',
          tags: ['api', 'json']
        }
      },

      {
        method: 'GET',
        path: '/bridges/events',
        handler: function (request, reply) {
          server.methods.getBridgeEvents(request, function (err, result) {
            if (err) {
              reply(boom.badRequest(err));
            } else {
              reply(result);
            }
          });
        },
        config: {
          auth: 'simple',
          description: 'Lists all events, both scheduled and actual',
          notes: 'An object with the keys: actualEvents and scheduledEvents, their values are what is generated from /bridges/events/actual, and /bridges/events/scheduled',
          tags: ['api', 'json']
        }
      },

      {
        method: 'GET',
        path: '/bridges/events/before/{date*}',
        handler: function (request, reply) {
          server.methods.getBridgeEvents(request, function (err, result) {
            if (err) {
              reply(boom.badRequest(err));
            } else {
              reply(result);
            }
          });
        },
        config: {
          auth: 'simple',
          validate: {
            params: {
              date: joi.date()
            }
          },
          description: 'Lists all bridge lift and scheduled events before given date (non-inclusive).',
          notes: 'An object with the keys: actualEvents and scheduledEvents, their values are what is generated from /bridges/events/actual, and /bridges/events/scheduled',
          tags: ['api', 'json']
        }
      },

      {
        method: 'GET',
        path: '/bridges/events/after/{date*}',
        handler: function (request, reply) {
          server.methods.getBridgeEvents(request, function (err, result) {
            if (err) {
              reply(boom.badRequest(err));
            } else {
              reply(result);
            }
          });
        },
        config: {
          auth: 'simple',
          validate: {
            params: {
              date: joi.date()
            }
          },
          description: 'Lists all bridge lift and scheduled after given date (non-inclusive).',
          notes: 'An object with the keys: actualEvents and scheduledEvents, their values are what is generated from /bridges/events/actual, and /bridges/events/scheduled',
          tags: ['api', 'json']
        }
      },

      {
        method: 'GET',
        path: '/bridges/events/between/{startDate}/{endDate*}',
        handler: function (request, reply) {
          server.methods.getBridgeEvents(request, function (err, result) {
            if (err) {
              reply(boom.badRequest(err));
            } else {
              reply(result);
            }
          });
        },
        config: {
          auth: 'simple',
          validate: {
            params: {
              startDate: joi.date(),
              endDate: joi.date()
            }
          },
          description: 'Lists all bridge lift and scheduled events between two given dates (non-inclusive).',
          notes: 'An object with the keys: actualEvents and scheduledEvents, their values are what is generated from /bridges/events/actual, and /bridges/events/scheduled',
          tags: ['api', 'json']
        }
      },

      {
        method: 'GET',
        path: '/bridges/events/actual',
        handler: function (request, reply) {
          server.methods.getBridgesActual(request, function (err, result) {
            if (err) {
              reply(boom.badRequest(err));
            } else {
              reply(result);
            }
          });
        },
        config: {
          auth: 'simple',
          description: 'Lists actual bridge lift events in a fancy view',
          notes: 'Array of objects with the keys `bridge`, `upTime`, and `downTime`',
          tags: ['api', 'json']
        }
      },

      {
        method: 'GET',
        path: '/bridges/events/actual/{limit*}',
        handler: function (request, reply) {
          server.methods.getBridgesActual(request, function (err, result) {
            if (err) {
              reply(boom.badRequest(err));
            } else {
              reply(result);
            }
          });
        },
        config: {
          auth: 'simple',
          validate: {
            params: {
              limit: joi.number().integer()
            }
          },
          description: 'Lists actual bridge lift events in json',
          notes: 'Array of objects with the keys `bridge`, `upTime`, and `downTime`',
          tags: ['api', 'json']
        }
      },

      {
        method: 'GET',
        path: '/bridges/events/actual/before/{date*}',
        handler: function (request, reply) {
          server.methods.getBridgesActual(request, function (err, result) {
            if (err) {
              reply(boom.badRequest(err));
            } else {
              reply(result);
            }
          });
        },
        config: {
          auth: 'simple',
          validate: {
            params: {
              date: joi.date()
            }
          },
          description: 'Lists actual bridge lift events in before given date (non-inclusive).',
          notes: 'Array of objects with the keys `bridgeId`, `upTime`, and `downTime`. Date must be given in a format that `new Date()` can parse.',
          tags: ['api', 'json']
        }
      },

      {
        method: 'GET',
        path: '/bridges/events/actual/after/{date*}',
        handler: function (request, reply) {
          server.methods.getBridgesActual(request, function (err, result) {
            if (err) {
              reply(boom.badRequest(err));
            } else {
              reply(result);
            }
          });
        },
        config: {
          auth: 'simple',
          validate: {
            params: {
              date: joi.date()
            }
          },
          description: 'Lists actual bridge lift events in after given date (non-inclusive).',
          notes: 'Array of objects with the keys `bridgeId`, `upTime`, and `downTime`. Date must be given in a format that `new Date()` can parse.',
          tags: ['api', 'json']
        }
      },

      {
        method: 'GET',
        path: '/bridges/events/actual/between/{startDate}/{endDate*}',
        handler: function (request, reply) {
          server.methods.getBridgesActual(request, function (err, result) {
            if (err) {
              reply(boom.badRequest(err));
            } else {
              reply(result);
            }
          });
        },
        config: {
          auth: 'simple',
          validate: {
            params: {
              startDate: joi.date(),
              endDate: joi.date()
            }
          },
          description: 'Lists actual bridge lift events between two given dates (non-inclusive).',
          notes: 'Array of objects with the keys `bridgeId`, `upTime`, and `downTime`. Date must be given in a format that `new Date()` can parse.',
          tags: ['api', 'json']
        }
      },

      {
        method: 'GET',
        path: '/bridges/{bridge}',
        handler: function (request, reply) {
          server.methods.getBridge(request.params.bridge, function (err, result) {
            if (err) {
              reply(boom.badRequest(err));
            } else {
              reply(result);
            }
          });
        },
        config: {
          auth: 'simple',
          validate: {
            params: {
              bridge: joi.string().valid(bridgeOptions)
            }
          },
          description: 'Lists data for a specified bridge',
          notes: 'An object with the keys: name, id, totalUpTime, avgUpTime, actualCount, and scheduledCount.\n - totalUpTime is the cumulative time the bridge has been in a lifted state since the start of recording.\n - avgUpTime is the totalUpTime divided by the actualCount.\n - actualCount is the total number of recorded lift events.\n - scheduledCount is the number of lifts that have been scheduled for this bridge',
          tags: ['api', 'json']
        }
      },

      {
        method: 'GET',
        path: '/bridges/{bridge}/events',
        handler: function (request, reply) {
          server.methods.getBridgeEvents(request, function (err, result) {
            if (err) {
              reply(boom.badRequest(err));
            } else {
              reply(result);
            }
          });
        },
        config: {
          auth: 'simple',
          validate: {
            params: {
              bridge: joi.string().allow(bridgeOptions)
            }
          },
          description: 'Lists all events, both scheduled and actual for a given bridge',
          notes: 'An object with the keys: bridgeEvents and scheduledEvents, their values are what is generated returned',
          tags: ['api', 'json']
        }
      },

      {
        method: 'GET',
        path: '/bridges/{bridge}/events/before/{date*}',
        handler: function (request, reply) {
          server.methods.getBridgeEvents(request, function (err, result) {
            if (err) {
              reply(boom.badRequest(err));
            } else {
              reply(result);
            }
          });
        },
        config: {
          auth: 'simple',
          validate: {
            params: {
              bridge: joi.string().allow(bridgeOptions),
              date: joi.date()
            }
          },
          description: 'Lists all events, both scheduled and actual for a given bridge before given date (non-inclusive).',
          notes: 'An object with the keys: actualEvents and scheduledEvents, their values are what is generated from /bridges/{bridge}events/actual, and /bridges/{bridge}/events/scheduled',
          tags: ['api', 'json']
        }
      },

      {
        method: 'GET',
        path: '/bridges/{bridge}/events/after/{date*}',
        handler: function (request, reply) {
          server.methods.getBridgeEvents(request, function (err, result) {
            if (err) {
              reply(boom.badRequest(err));
            } else {
              reply(result);
            }
          });
        },
        config: {
          auth: 'simple',
          validate: {
            params: {
              bridge: joi.string().allow(bridgeOptions),
              date: joi.date()
            }
          },
          description: 'Lists all events, both scheduled and actual for a given bridge after given date (non-inclusive).',
          notes: 'An object with the keys: actualEvents and scheduledEvents, their values are what is generated from /bridges/{bridge}events/actual, and /bridges/{bridge}/events/scheduled',
          tags: ['api', 'json']
        }
      },

      {
        method: 'GET',
        path: '/bridges/{bridge}/events/between/{startDate}/{endDate*}',
        handler: function (request, reply) {
          server.methods.getBridgeEvents(request, function (err, result) {
            if (err) {
              reply(boom.badRequest(err));
            } else {
              reply(result);
            }
          });
        },
        config: {
          auth: 'simple',
          validate: {
            params: {
              bridge: joi.string().allow(bridgeOptions),
              startDate: joi.date(),
              endDate: joi.date()
            }
          },
          description: 'Lists all events, both scheduled and actual for a given bridge between two given dates (non-inclusive).',
          notes: 'An object with the keys: actualEvents and scheduledEvents, their values are what is generated from /bridges/{bridge}events/actual, and /bridges/{bridge}/events/scheduled',
          tags: ['api', 'json']
        }
      },

      {
        method: 'GET',
        path: '/bridges/{bridge}/events/actual/{limit*}',
        handler: function (request, reply) {
          server.methods.getBridgeActual(request, function (err, result) {
            if (err) {
              reply(boom.badRequest(err));
            } else {
              reply(result);
            }
          });
        },
        config: {
          auth: 'simple',
          validate: {
            params: {
              bridge: joi.string().allow(bridgeOptions),
              limit: joi.number().integer()
            }
          },
          description: 'Returns last x lift events for given bridge if limit param is provided. If limit param is not provided, it returns all entries. Non-numbers are ignored',
          notes: 'Authentication is specified by an access token as a query parameter, i.e. `/bridges/events/actual?access_token=1234`.',
          tags: ['api', 'json']
        }
      },

      {
        method: 'GET',
        path: '/bridges/{bridge}/events/actual/before/{date*}',
        handler: function (request, reply) {
          server.methods.getBridgeActual(request, function (err, result) {
            if (err) {
              reply(boom.badRequest(err));
            } else {
              reply(result);
            }
          });
        },
        config: {
          auth: 'simple',
          validate: {
            params: {
              bridge: joi.string().allow(bridgeOptions),
              date: joi.date()
            }
          },
          description: 'Lists actual bridge lift events in before given date (non-inclusive) for a given bridge.',
          notes: 'Array of objects with the keys `bridgeId`, `upTime`, and `downTime`. Date must be given in a format that `new Date()` can parse.',
          tags: ['api', 'json']
        }
      },

      {
        method: 'GET',
        path: '/bridges/{bridge}/events/actual/after/{date*}',
        handler: function (request, reply) {
          server.methods.getBridgeActual(request, function (err, result) {
            if (err) {
              reply(boom.badRequest(err));
            } else {
              reply(result);
            }
          });
        },
        config: {
          auth: 'simple',
          validate: {
            params: {
              bridge: joi.string().allow(bridgeOptions),
              date: joi.date()
            }
          },
          description: 'Lists actual bridge lift events in after given date (non-inclusive) for a given bridge.',
          notes: 'Array of objects with the keys `bridgeId`, `upTime`, and `downTime`. Date must be given in a format that `new Date()` can parse.',
          tags: ['api', 'json']
        }
      },

      {
        method: 'GET',
        path: '/bridges/{bridge}/events/actual/between/{startDate}/{endDate*}',
        handler: function (request, reply) {
          server.methods.getBridgeActual(request, function (err, result) {
            if (err) {
              reply(boom.badRequest(err));
            } else {
              reply(result);
            }
          });
        },
        config: {
          auth: 'simple',
          validate: {
            params: {
              bridge: joi.string().allow(bridgeOptions),
              startDate: joi.date(),
              endDate: joi.date()
            }
          },
          description: 'Lists actual bridge lift events between two given dates (non-inclusive) for a given bridge.',
          notes: 'Array of objects with the keys `bridgeId`, `upTime`, and `downTime`. Date must be given in a format that `new Date()` can parse.',
          tags: ['api', 'json']
        }
      },

      {
        method: 'GET',
        path: '/bridges/events/scheduled',
        handler: function (request, reply) {
          server.methods.getBridgesScheduled(request, function (err, result) {
            if (err) {
              reply(boom.badRequest(err));
            } else {
              reply(result);
            }
          });
        },
        config: {
          auth: 'simple',
          description: 'Lists scheduled bridge lift events from l-bridge in fancy view',
          notes: 'Array of objects with the keys `bridgeId`, `type`, `requestTime`, and `estimatedLiftTime`',
          tags: ['api', 'json']
        }
      },

      {
        method: 'GET',
        path: '/bridges/events/scheduled/{limit*}',
        handler: function (request, reply) {
          server.methods.getBridgesScheduled(request, function (err, result) {
            if (err) {
              reply(boom.badRequest(err));
            } else {
              reply(result);
            }
          });
        },
        config: {
          auth: 'simple',
          validate: {
            params: {
              limit: joi.number().integer()
            }
          },
          description: 'Lists scheduled bridge lift events from l-bridge in json',
          notes: 'Array of objects with the keys `bridgeId`, `type`, `requestTime`, and `estimatedLiftTime`',
          tags: ['api', 'json']
        }
      },

      {
        method: 'GET',
        path: '/bridges/events/scheduled/before/{date*}',
        handler: function (request, reply) {
          server.methods.getBridgesScheduled(request, function (err, result) {
            if (err) {
              reply(boom.badRequest(err));
            } else {
              reply(result);
            }
          });
        },
        config: {
          auth: 'simple',
          validate: {
            params: {
              date: joi.date()
            }
          },
          description: 'Lists scheduled bridge lift events in before given date (non-inclusive).',
          notes: 'Array of objects with the keys `bridgeId`, `type`, `requestTime`, and `estimatedLiftTime`. Date must be given in a format that `new Date()` can parse.',
          tags: ['api', 'json']
        }
      },

      {
        method: 'GET',
        path: '/bridges/events/scheduled/after/{date*}',
        handler: function (request, reply) {
          server.methods.getBridgesScheduled(request, function (err, result) {
            if (err) {
              reply(boom.badRequest(err));
            } else {
              reply(result);
            }
          });
        },
        config: {
          auth: 'simple',
          validate: {
            params: {
              date: joi.date()
            }
          },
          description: 'Lists scheduled bridge lift events in after given date (non-inclusive).',
          notes: 'Array of objects with the keys `bridgeId`, `type`, `requestTime`, and `estimatedLiftTime`. Date must be given in a format that `new Date()` can parse.',
          tags: ['api', 'json']
        }
      },

      {
        method: 'GET',
        path: '/bridges/events/scheduled/between/{startDate}/{endDate*}',
        handler: function (request, reply) {
          server.methods.getBridgesScheduled(request, function (err, result) {
            if (err) {
              reply(boom.badRequest(err));
            } else {
              reply(result);
            }
          });
        },
        config: {
          auth: 'simple',
          validate: {
            params: {
              startDate: joi.date(),
              endDate: joi.date()
            }
          },
          description: 'Lists scheduled bridge lift events between two given dates (non-inclusive).',
          notes: 'Array of objects with the keys `bridgeId`, `type`, `requestTime`, and `estimatedLiftTime`. Date must be given in a format that `new Date()` can parse.',
          tags: ['api', 'json']
        }
      },

      {
        method: 'GET',
        path: '/bridges/{bridge}/events/scheduled/{limit*}',
        handler: function (request, reply) {
          server.methods.getBridgeScheduled(request, function (err, result) {
            if (err) {
              reply(boom.badRequest(err));
            } else {
              reply(result);
            }
          });
        },
        config: {
          auth: 'simple',
          validate: {
            params: {
              bridge: joi.string().allow(bridgeOptions),
              limit: joi.number().integer()
            }
          },
          description: 'Returns last x scheduled lift events for given bridge if limit param is provided. If limit param is not provided, it returns all entries. Non-numbers are ignored',
          notes: 'Authentication is specified by an access token as a query parameter, i.e. `/bridges/events/actual?access_token=1234`.',
          tags: ['api', 'json']
        }
      },

      {
        method: 'GET',
        path: '/bridges/{bridge}/events/scheduled/before/{date*}',
        handler: function (request, reply) {
          server.methods.getBridgeScheduled(request, function (err, result) {
            if (err) {
              reply(boom.badRequest(err));
            } else {
              reply(result);
            }
          });
        },
        config: {
          auth: 'simple',
          validate: {
            params: {
              bridge: joi.string().allow(bridgeOptions),
              date: joi.date()
            }
          },
          description: 'Lists scheduled bridge lift events in before given date (non-inclusive) for a given bridge.',
          notes: 'Array of objects with the keys `bridgeId`, `type`, `requestTime`, and `estimatedLiftTime`. Date must be given in a format that `new Date()` can parse.',
          tags: ['api', 'json']
        }
      },

      {
        method: 'GET',
        path: '/bridges/{bridge}/events/scheduled/after/{date*}',
        handler: function (request, reply) {
          server.methods.getBridgeScheduled(request, function (err, result) {
            if (err) {
              reply(boom.badRequest(err));
            } else {
              reply(result);
            }
          });
        },
        config: {
          auth: 'simple',
          validate: {
            params: {
              bridge: joi.string().allow(bridgeOptions),
              date: joi.date()
            }
          },
          description: 'Lists scheduled bridge lift events in after given date (non-inclusive) for a given bridge.',
          notes: 'Array of objects with the keys `bridgeId`, `type`, `requestTime`, and `estimatedLiftTime`. Date must be given in a format that `new Date()` can parse.',
          tags: ['api', 'json']
        }
      },

      {
        method: 'GET',
        path: '/bridges/{bridge}/events/scheduled/between/{startDate}/{endDate*}',
        handler: function (request, reply) {
          server.methods.getBridgeScheduled(request, function (err, result) {
            if (err) {
              reply(boom.badRequest(err));
            } else {
              reply(result);
            }
          });
        },
        config: {
          auth: 'simple',
          validate: {
            params: {
              bridge: joi.string().allow(bridgeOptions),
              startDate: joi.date(),
              endDate: joi.date()
            }
          },
          description: 'Lists scheduled bridge lift events between two given dates (non-inclusive) for a given bridge.',
          notes: 'Array of objects with the keys `bridgeId`, `type`, `requestTime`, and `estimatedLiftTime`. Date must be given in a format that `new Date()` can parse.',
          tags: ['api', 'json']
        }
      }
    ]);
  }
  return addRoutes;
};

exports['@singleton'] = true;
exports['@require'] = [ 'logger', 'handlers' ];
