var util   = require('util');
var stream = require('stream');

exports = module.exports = function (logger, serverConfig) {
  var addServerSockets = function (server) {
    var io = require('socket.io')(server.listener);
    var bridgeEventSocket = io.on('connection', function (socket) {
      // disconnect users who try to send us data
      socket.conn.on('data', function (chunk) {
        socket.disconnect();
        var logString = util.format("%s [%s] tried to send data and was disconnected",
          (new Date()).getTime(),
          socket.handshake.headers['x-forwarded-for'] || this.remoteAddress
        );
        // console.log is for fail2ban, leave both in
        console.log(logString);
        logger.warn(logString);
      });

      socket.emit('bridge data', serverConfig.bridges);
      var logString = util.format("[%s] %s sent from %s",
        socket.handshake.headers['x-forwarded-for'] || socket.handshake.address,
        "socket",
        socket.handshake.headers.referer
      );
      logger.info(logString);
    });

    server.eventEmitters = {
      bridgeEventSocket:  bridgeEventSocket,
      bridgeSSE:          new stream.PassThrough()
    };
    server.eventEmitters.bridgeSSE.setMaxListeners(0);
  };
  return addServerSockets;
};

exports['@singleton'] = true;
exports['@require'] = [ 'logger', 'config' ];
