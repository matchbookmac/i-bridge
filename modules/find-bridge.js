var _              = require('lodash');
var db             = require('../models/index');
var Bridge         = db.bridge;

module.exports = function findBridge(request, callback) {
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
  }).catch(function (error) {
    callback(err, null);
  });
};
