var http = require('http');
var httpProxy = require('http-proxy');
var _ = require('lodash');
var ip = require('ip');


var proxy8000 = httpProxy.createProxyServer({});

proxy8000.on('proxyReq', function (proxyReq, req, res, options) {
  proxyReq.setHeader('x-forwarded-proto', 'http');
  proxyReq.setHeader('x-forwarded-port', 9000);
  proxyReq.setHeader('x-forwarded-for', ip.address());
  console.log(8000, proxyReq._renderHeaders());
});

var server = http.createServer(function (req, res) {
  proxy8000.web(req, res, {
    target: 'http://localhost:80'
  });
});

server.listen(8000, null, null, function () {
  console.log('listening on 8000');
});

// // port = req.headers.host
// // proto = req.connection.encrypted or req.connection.pair
// // for = req.connection.remoteAddress || req.socket.remoteAddress
//
var proxy9000 = httpProxy.createProxyServer({});
//
// proxy9000.on('proxyReq', function (proxyReq, req, res, options) {
//   proxyReq.setHeader('host', ip.address() + ":" + 9000);
//   req.connection.remoteAddress = ip.address();
//   console.log(proxyReq.connection.remoteAddress);
//   console.log(req.headers);
//   // console.log(proxyReq.connection);
//   console.log(9000, proxyReq._renderHeaders());
//   // console.log(_.keys(req.connection));
//   // console.log(_.functions(req.connection));
// });
//
var server = http.createServer(function (req, res) {
  proxy9000.web(req, res, {
    target: 'http://localhost:8000'
  });
});

server.listen(9000, null, null, function () {
  console.log('listening on 9000');
});
