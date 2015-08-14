var
  http     = require('http'),
  wlog     = require('winston'),
  ip       = require('ip')
;

module .exports = function testPost(bridgeData, sendOptions, callback){
  bridgeData = JSON.stringify(bridgeData);
  if (!sendOptions) sendOptions = {};
console.log(bridgeData);
  var
    options = {
      hostname: sendOptions.hostname || ip.address(),
      // "52.26.186.75" for a-bridge
      port:     sendOptions.port     || 80,
      path:     sendOptions.path     || "/incoming-snmp",
      method:   sendOptions.method   || "POST",
      headers:  sendOptions.headers  || {
        "Content-Type":   "application/json",
        "Content-Length": bridgeData.length
      }
    },
    response = ''
  ;
console.log(options.hostname);
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
