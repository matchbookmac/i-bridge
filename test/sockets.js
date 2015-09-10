var socket = require('socket.io-client')('http://54.191.150.69');
socket.on('bridge data', function (data) {
  console.log(data);
});
// setInterval(beAnnoying, 2000);
//
// setTimeout(function () {
//   process.exit();
// }, 15000);

function beAnnoying() {
  socket.emit('bridge data', { foo: 'bar'});
  console.log('beep');
  return;
}
beAnnoying();
// setTimeout(function () {
//   socket.disconnect();
// }, 1800);
