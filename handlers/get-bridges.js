var _              = require('lodash');
var db             = require('../models/index');
var Bridge         = db.bridge;
var logger         = require('../config/logging');

module.exports = function (request, reply) {
  Bridge.findAll({
    where: {
      name: {
        $not: null
      }
    }
  }).then(function (rows) {
    var response = reply(_.map(rows, function (bridge) {
      return bridge.name;
    }));
    response.header('Access-Control-Allow-Origin', '*');
  })
  .catch(function (err) {
    reply(err);
    logger.error('There was an error finding bridges: ' + err);
  });
};
