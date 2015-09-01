var              _ = require('lodash');
var db             = require('../models/index');
var BridgeEvent    = db.BridgeEvent;
var wlog           = require('winston');

module.exports = function (request, reply) {
  var bridge = '%';
  _.forIn(request.params.bridge.split(/[\W\d]+/), function (bridgeName) {
    bridge += (bridgeName+'%');
  });
  BridgeEvent.findAll({ limit: 5,
                        order: 'up_time DESC',
                        where: {
                          bridge: {
                            $like: bridge
                          }
                        }
                      })
              .then(function (rows) {
                reply(rows);
              })
              .catch(function (err) {
                reply(err);
                wlog.error('There was an error finding bridge events for '+ bridge +': '+ err);
              });

};
