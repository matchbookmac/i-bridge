var
  argv     = require('minimist')(process.argv.slice(2)),
  testPost = require('./mock-post'),
  options  = {}
;
var
  bridge     = argv.b || argv.bridge,
  status     = argv.s || argv.status,
  timeStamp  = argv.t || argv.timestamp,
  hostname   = argv.h || argv.hostname,
  port       = argv.p || argv.port,
  path       = argv.P || argv.path,
  method     = argv.m || argv.method,
  headers    = argv.H || argv.headers,
  othMsgVals = argv._
;

var testMessage = {
    bridge:    bridge    ? bridge    : "bailey's bridge",
    status:    status    ? status    : true,
    timeStamp: timeStamp ? timeStamp : (new Date()).toString()
  };

if (othMsgVals.length > 0) {
  testMessage.othMsgVals = othMsgVals;
}

if (hostname) options.hostname = hostname;
if (port)     options.port     = port;
if (path)     options.path     = path;
if (method)   options.method   = method;
if (headers)  options.headers  = headers;

testPost(testMessage, options);
