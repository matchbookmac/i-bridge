var              _ = require('lodash');
var db             = require('../models/index');
var ActualEvent    = db.actualEvent;
var wlog           = require('winston');

module.exports = function (request, reply) {
  var limit = parseInt(request.params.limit);
  var bridge = '%';
  _.forIn(request.params.bridge.split(/[\W\d]+/), function (bridgeName) {
    bridge += (bridgeName+'%');
  });
  var params = {
    order: 'upTime DESC',
    where: {
      bridge: {
        $like: bridge
      }
    }
  };
  if (limit) params.limit = limit;
  ActualEvent.findAll(params)
              .then(function (rows) {
                var response = reply(rows);
                response.header('Access-Control-Allow-Origin', '*');
              })
              .catch(function (err) {
                reply(err);
                wlog.error('There was an error finding bridge events for '+ bridge +': '+ err);
              });

};
