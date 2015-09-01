var _              = require('lodash');
var db             = require('../models/index');
var sequelize      = db.sequelize;
var wlog           = require('winston');

module.exports = function (request, reply) {
  sequelize.query('SELECT DISTINCT bridge FROM BridgeEvents', { type: sequelize.QueryTypes.SELECT })
              .then(function (rows) {
                reply(_.map(rows, function (bridge) {
                  return bridge.bridge;
                }));
              })
              .catch(function (err) {
                reply(err);
                wlog.error('There was an error finding bridges: ' + err);
              });
};
