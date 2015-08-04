//Listen to L-bridge for event
//should be plced in a seperate repo for a-bridge code

var dgram = require('dgram');
var server = dgram.createSocket('udp4');

// Listen for emission of the "message" event.
server.on('message', function (message) {
    console.log('Received ' + message);
});

// Bind to port 4040
var port = 4040;
server.bind(port);
console.log('Listening on '+port); 