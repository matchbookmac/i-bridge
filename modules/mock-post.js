var http     = require('http');
var iBridge  = require('../config/config').iBridge;
var ip       = require('ip');

exports = module.exports = function (logger) {
  var mockPost = function (bridgeData, options, callback){
    bridgeData = JSON.stringify(bridgeData);
    var response = '';

    if (!options) options = {};
    options.hostname = options.hostname || iBridge.hostname || ip.address();
      // "54.191.150.69" for i-bridge
    options.port     = options.port     || iBridge.port;
    options.path     = options.path     || iBridge.path ;
    options.method   = options.method   || iBridge.method;
    options.headers  = options.headers  || iBridge.headers;
    options.headers["Content-Length"] = bridgeData.length;

    var req = http.request(options, function (res) {
      res.setEncoding('utf8');
      var status = res.statusCode;

      res.on('data', function (chunk) {
        response += chunk;
      });

      res.on('end', function () {
        if (callback) callback(response, status);
        logger.info("Request Status: " + status, response);
      });
    });

    req.on("error", function (err) {
      if (callback) {
        callback(err.message, null);
      } else {
        logger.info(err);
      }
    });

    req.write(bridgeData);
    req.end();
  };
  return mockPost;
};

exports['@singleton'] = true;
exports['@require'] = [ 'logger' ];
