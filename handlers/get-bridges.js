var _              = require('lodash');
var db             = require('../models/index');
var Bridge      = db.bridge;
var wlog           = require('winston');

module.exports = function (request, reply) {
  Bridge.findAll({
    where: {
      name: {
        $not: null
      }
    }
  }).then(function (rows) {
    var response = reply(_.map(rows, function (bridge) {
      return bridge.bridge;
    }));
    response.header('Access-Control-Allow-Origin', '*');
  })
  .catch(function (err) {
    reply(err);
    wlog.error('There was an error finding bridges: ' + err);
  });
};
