var util = require('util');

exports = module.exports = function (logger) {
  var addServerResponseLogging = function (server) {
    server.on('response', function (request) {
      var remoteAddress = request.headers['x-forwarded-for'] || request.info.remoteAddress;
      var logString = util.format("[%s] %s %s - %s",
        remoteAddress,
        request.method,
        request.url.path,
        request.response.statusCode
      );
      // Ignore AWS load balancer pings so they don't bloat the logs
      if (remoteAddress != '10.131.1.236' && remoteAddress != '10.131.0.75') {
        logger.info(logString);
      }
    });
  };
  return addServerResponseLogging;
};

exports['@singleton'] = true;
exports['@require'] = [ 'logger' ];
