var db             = require('../models/index');
var sequelize      = db.sequelize;
var wlog           = require('winston');

module.exports = function (request, reply) {
  sequelize.query('SELECT DISTINCT bridge FROM bridgeEvents', { type: sequelize.QueryTypes.SELECT })
              .then(function (rows) {
                reply(rows);
              })
              .catch(function (err) {
                reply(err);
                wlog.error('There was an error finding bridges: ' + err);
              });
};
