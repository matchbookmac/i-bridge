var db             = require('../models/index');
var BridgeEvent    = db.BridgeEvent;
var wlog           = require('winston');

module.exports = function (request, reply) {
  var bridge = request.params.bridge;
  BridgeEvent.findAll({ limit: 5,
                        order: 'up_time DESC',
                        where: {
                          bridge: bridge
                          // {
                          //   $iLike: '%'+bridge+'%'
                          // }
                        }
                        // ,
                        // order: 'up_time DESC'
                      })
              .then(function (rows) {
                reply(rows);
              })
              .catch(function (err) {
                reply(err);
                wlog.error('There was an error finding bridge events for '+ bridge +': '+ err);
              });
};
