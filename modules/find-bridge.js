var _              = require('lodash');
var db             = require('../models/index');
var Bridge         = db.bridge;

module.exports = function findBridge(request, callback) {
  if (request.params.bridge) {
    if (isNaN(parseInt(request.params.bridge))) {
      var bridge = '%';
      _.forIn(request.params.bridge.split(/[\W\d]+/), function (bridgeName) {
        bridge += (bridgeName+'%');
      });
      Bridge.findOne({
        where: {
          name: {
            $like: bridge
          }
        }
      }).then(function (bridge) {
        callback(null, bridge);
      }).catch(function (err) {
        callback(err, null);
      });
    } else {
      var bridgeId = parseInt(request.params.bridge);
      Bridge.findOne({
        where: {
          id: bridgeId
        }
      }).then(function (bridge) {
        callback(null, bridge);
      }).catch(function (err) {
        callback(err, null);
      });
    }
  } else {
    callback(null, null);
  }
};
