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
                "scheduledLifts": joi.array().min(0).items(
                  joi.object({
                    type: joi.string(),
                    requestTime: joi.date().required(),
                    estimatedLiftTime: joi.date().required()
                  })
                ),
                "lastFive": joi.array().min(0)
                  .items(joi.object({
                    id: joi.number().integer(),
                    bridgeId: joi.number().integer(),
                    upTime: joi.date().required(),
                    downTime: joi.date().required(),
                    createdAt: joi.date().required(),
                    updatedAt: joi.date().required()
                  })).single()
                })
              )
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
          description: 'Data for a specified bridge',
          notes: 'Return value is an object with the keys: name, id, totalUpTime, avgUpTime, actualCount, and scheduledCount.\n - totalUpTime is the cumulative time the bridge has been in a lifted state since the start of recording.\n - avgUpTime is the totalUpTime divided by the actualCount.\n - actualCount is the total number of recorded lift events.\n - scheduledCount is the number of lifts that have been scheduled for this bridge',
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
              bridge: joi.string().valid(bridgeOptions)
            }
          },
          description: 'Scheduled and actual events for a bridge',
          notes: 'Return value is an object with the keys: \n - actualEvents\n - scheduledEvents\nTheir values are what is generated from:\n - /bridges/{bridge}/events/scheduled\n - /bridges/{bridge}/events/actual',
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
              bridge: joi.string().valid(bridgeOptions),
              limit: joi.number().integer()
            }
          },
          description: 'Actual lift events for given bridge',
          notes: 'Return value is an array of objects, each with the keys:\n - id: integer corresponding id of the record\n - bridgeId: integer corresponding to the bridge\'s id\n - upTime: timestamp corresponding to when the event started\n - downTime: timestamp corresponding to when the event ended\n\nReturns last x lift events for given bridge if limit param is provided. If limit param is not provided, it returns all entries. Non-numbers are ignored',
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
              bridge: joi.string().valid(bridgeOptions),
              date: joi.date()
            }
          },
          description: 'Actual lift events for given bridge after date',
          notes: 'Return value is an array of objects, each with the keys:\n - id: integer corresponding id of the record\n - bridgeId: integer corresponding to the bridge\'s id\n - upTime: timestamp corresponding to when the event started\n - downTime: timestamp corresponding to when the event ended',
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
              bridge: joi.string().valid(bridgeOptions),
              date: joi.date()
            }
          },
          description: 'Actual lift events for given bridge before date',
          notes: 'Return value is an array of objects, each with the keys:\n - id: integer corresponding id of the record\n - bridgeId: integer corresponding to the bridge\'s id\n - upTime: timestamp corresponding to when the event started\n - downTime: timestamp corresponding to when the event ended',
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
              bridge: joi.string().valid(bridgeOptions),
              startDate: joi.date(),
              endDate: joi.date()
            }
          },
          description: 'Actual lift events for given bridge between dates',
          notes: 'Return value is an array of objects, each with the keys:\n - id: integer corresponding id of the record\n - bridgeId: integer corresponding to the bridge\'s id\n - upTime: timestamp corresponding to when the event started\n - downTime: timestamp corresponding to when the event ended',
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
              bridge: joi.string().valid(bridgeOptions),
              date: joi.date()
            }
          },
          description: 'Scheduled and actual events for a bridge after date',
          notes: 'Return value is an object with the keys: \n - actualEvents\n - scheduledEvents\nTheir values are what is generated from:\n - /bridges/{bridge}/events/actual\n - /bridges/{bridge}/events/scheduled',
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
              bridge: joi.string().valid(bridgeOptions),
              date: joi.date()
            }
          },
          description: 'Scheduled and actual events for a bridge before date',
          notes: 'Return value is an object with the keys: \n - actualEvents\n - scheduledEvents\nTheir values are what is generated from:\n - /bridges/{bridge}/events/actual\n - /bridges/{bridge}/events/scheduled',
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
              bridge: joi.string().valid(bridgeOptions),
              startDate: joi.date(),
              endDate: joi.date()
            }
          },
          description: 'Scheduled and actual events for a bridge between dates',
          notes: 'Return value is an object with the keys: \n - actualEvents\n - scheduledEvents\nTheir values are what is generated from:\n - /bridges/{bridge}/events/actual\n - /bridges/{bridge}/events/scheduled',
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
              bridge: joi.string().valid(bridgeOptions),
              limit: joi.number().integer()
            }
          },
          description: 'Scheduled lift events for given bridge',
          notes: 'Return value is an array of objects, each with the keys:\n - id: integer corresponding id of the record\n - bridgeId: integer corresponding to the bridge\'s id\n - requestTime: timestamp corresponding to when the request for a lift was received\n - estimatedLiftTime: timestamp corresponding to when requester expected the lift to occur\n\nReturns last x lift events for given bridge if limit param is provided. If limit param is not provided, it returns all entries. Non-numbers are ignored',
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
              bridge: joi.string().valid(bridgeOptions),
              date: joi.date()
            }
          },
          description: 'Scheduled lift events for given bridge after date',
          notes: 'Return value is an array of objects, each with the keys:\n - id: integer corresponding id of the record\n - bridgeId: integer corresponding to the bridge\'s id\n - requestTime: timestamp corresponding to when the request for a lift was received\n - estimatedLiftTime: timestamp corresponding to when requester expected the lift to occur',
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
              bridge: joi.string().valid(bridgeOptions),
              date: joi.date()
            }
          },
          description: 'Scheduled lift events for given bridge before date',
          notes: 'Return value is an array of objects, each with the keys:\n - id: integer corresponding id of the record\n - bridgeId: integer corresponding to the bridge\'s id\n - requestTime: timestamp corresponding to when the request for a lift was received\n - estimatedLiftTime: timestamp corresponding to when requester expected the lift to occur.',
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
              bridge: joi.string().valid(bridgeOptions),
              startDate: joi.date(),
              endDate: joi.date()
            }
          },
          description: 'Scheduled lift events for given bridge between dates',
          notes: 'Return value is an array of objects, each with the keys:\n - id: integer corresponding id of the record\n - bridgeId: integer corresponding to the bridge\'s id\n - requestTime: timestamp corresponding to when the request for a lift was received\n - estimatedLiftTime: timestamp corresponding to when requester expected the lift to occur.',
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
          description: 'Scheduled and actual events for all bridges',
          notes: 'Return value is an object with the keys: \n - actualEvents\n - scheduledEvents\nTheir values are what is generated from:\n - /bridges/events/scheduled\n - /bridges/events/actual',
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
          description: 'Actual lift events for all bridges',
          notes: 'Return value is an array of objects, each with the keys:\n - id: integer corresponding id of the record\n - bridgeId: integer corresponding to the bridge\'s id\n - upTime: timestamp corresponding to when the event started\n - downTime: timestamp corresponding to when the event ended.\n Returns last x lift events for given bridge if limit param is provided. If limit param is not provided, it returns all entries. Non-numbers are ignored',
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
          description: 'Actual lift events for all bridges',
          notes: 'Return value is an array of objects, each with the keys:\n - id: integer corresponding id of the record\n - bridgeId: integer corresponding to the bridge\'s id\n - upTime: timestamp corresponding to when the event started\n - downTime: timestamp corresponding to when the event ended.\n\nReturns last x lift events for given bridge if limit param is provided. If limit param is not provided, it returns all entries. Non-numbers are ignored',
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
          description: 'Actual lift events for all bridges after date',
          notes: 'Return value is an array of objects, each with the keys:\n - id: integer corresponding id of the record\n - bridgeId: integer corresponding to the bridge\'s id\n - upTime: timestamp corresponding to when the event started\n - downTime: timestamp corresponding to when the event ended.',
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
          description: 'Actual lift events for all bridges before date',
          notes: 'Return value is an array of objects, each with the keys:\n - id: integer corresponding id of the record\n - bridgeId: integer corresponding to the bridge\'s id\n - upTime: timestamp corresponding to when the event started\n - downTime: timestamp corresponding to when the event ended.',
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
          description: 'Actual lift events for all bridges between dates',
          notes: 'Return value is an array of objects, each with the keys:\n - id: integer corresponding id of the record\n - bridgeId: integer corresponding to the bridge\'s id\n - upTime: timestamp corresponding to when the event started\n - downTime: timestamp corresponding to when the event ended.',
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
          description: 'Actual and scheduled lift events for all bridges after date',
          notes: 'Return value is an object with the keys: \n - actualEvents\n - scheduledEvents\nTheir values are what is generated from:\n - /bridges/events/scheduled/after/{date}\n - /bridges/events/actual/after/{date}',
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
          description: 'Actual and scheduled lift events for all bridges before date',
          notes: 'Return value is an object with the keys: \n - actualEvents\n - scheduledEvents\nTheir values are what is generated from:\n - /bridges/events/scheduled/after/{date}\n - /bridges/events/actual/after/{date}',
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
          description: 'Actual and scheduled lift events for all bridges between dates',
          notes: 'Return value is an object with the keys: \n - actualEvents\n - scheduledEvents\nTheir values are what is generated from:\n - /bridges/events/scheduled/between/{startDate}/{endDate}\n - /bridges/events/actual/between/{startDate}/{endDate}',
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
          description: 'Scheduled lift events for all bridges',
          notes: 'Return value is an array of objects, each with the keys:\n - id: integer corresponding id of the record\n - bridgeId: integer corresponding to the bridge\'s id\n - requestTime: timestamp corresponding to when the request for a lift was received\n - estimatedLiftTime: timestamp corresponding to when requester expected the lift to occur',
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
          description: 'Scheduled lift events for all bridges',
          notes: 'Return value is an array of objects, each with the keys:\n - id: integer corresponding id of the record\n - bridgeId: integer corresponding to the bridge\'s id\n - requestTime: timestamp corresponding to when the request for a lift was received\n - estimatedLiftTime: timestamp corresponding to when requester expected the lift to occur.\n\nReturns last x lift events for given bridge if limit param is provided. If limit param is not provided, it returns all entries. Non-numbers are ignored',
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
          description: 'Scheduled lift events for all bridges after date',
          notes: 'Return value is an array of objects, each with the keys:\n - id: integer corresponding id of the record\n - bridgeId: integer corresponding to the bridge\'s id\n - requestTime: timestamp corresponding to when the request for a lift was received\n - estimatedLiftTime: timestamp corresponding to when requester expected the lift to occur.',
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
          description: 'Scheduled lift events for all bridges before date',
          notes: 'Return value is an array of objects, each with the keys:\n - id: integer corresponding id of the record\n - bridgeId: integer corresponding to the bridge\'s id\n - requestTime: timestamp corresponding to when the request for a lift was received\n - estimatedLiftTime: timestamp corresponding to when requester expected the lift to occur.',
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
          description: 'Scheduled lift events for all bridges before date',
          notes: 'Return value is an array of objects, each with the keys:\n - id: integer corresponding id of the record\n - bridgeId: integer corresponding to the bridge\'s id\n - requestTime: timestamp corresponding to when the request for a lift was received\n - estimatedLiftTime: timestamp corresponding to when requester expected the lift to occur.',
          tags: ['api', 'json']
        }
      }
    ]);
  }
  return addRoutes;
};

exports['@singleton'] = true;
exports['@require'] = [ 'logger', 'handlers' ];
