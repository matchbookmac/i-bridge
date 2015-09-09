var http     = require('http');
var wlog     = require('winston');
var port     = require('../config/config').port;
var iBridge  = require('../config/config').iBridge;
var ip       = require('ip');

module .exports = function testPost(bridgeData, sendOptions, callback){
  bridgeData = JSON.stringify(bridgeData);
  if (!sendOptions) sendOptions = {};
  var
    options = {
      hostname: sendOptions.hostname || iBridge.hostname || ip.address(),
      // "54.191.150.69" for i-bridge
      port:     sendOptions.port     || port,
      path:     sendOptions.path     || iBridge.path,
      method:   sendOptions.method   || iBridge.method,
      headers:  sendOptions.headers  || iBridge.headers
    },
    response = ''
  ;
  options.headers["Content-Length"] = bridgeData.length;
  var req = http.request(options, function (res) {
    res.setEncoding('utf8');
    var status = res.statusCode;

    res.on('data', function (chunk) {
      response += chunk;
    });

    res.on('end', function () {
      if (callback) callback(response, status);
      wlog.info("Request Status: " + status, response);
    });
  });

  req.on("error", function (err) {
    if (callback) {
      callback(err.message, null);
    } else {
      wlog.info(err);
    }
  });

  req.write(bridgeData);
  req.end();
};
