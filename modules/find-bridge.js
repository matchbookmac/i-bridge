var _ = require('lodash');

exports = module.exports = function (logger, db) {
  var Bridge         = db.bridge;
  var findBridge = function (bridge, callback) {
    if (bridge) {
      if (isNaN(parseInt(bridge))) {
        var bridgeString = '%';
        _.forIn(bridge.split(/[\W\d]+/), function (bridgeName) {
          bridgeString += (bridgeName+'%');
        });
        Bridge.findOne({
          where: {
            name: {
              $like: bridgeString
            }
          }
        }).then(function (bridge) {
          callback(null, bridge);
        }).catch(function (err) {
          callback(err, null);
        });
      } else {
        var bridgeId = parseInt(bridge);
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
  return findBridge;
};

exports['@singleton'] = true;
exports['@require'] = [ 'logger', 'database' ];
