var argv     = require('minimist')(process.argv.slice(2));
var testPost = require('./mock-post');
var options  = {};
var bridges  = require('../config/config').bridges;

var bridge      = argv.b || argv.bridge;
var hostname    = argv.h || argv.hostname;
var headers     = argv.H || argv.headers;
var liftTime    = argv.l || argv.liftTime;
var method      = argv.m || argv.method;
var port        = argv.p || argv.port;
var path        = argv.P || argv.path;
var timeStamp   = argv.t || argv.timestamp || new Date();
var status      = argv.s || argv.status;
var scheduled   = argv.S || argv.scheduled;
var type        = argv.T || argv.type;
var othMsgVals  = argv._;

status = (status !== 'false') || false;

var message = bridges;

message.changed.item = 'status';
message.changed.bridge = 'baileys bridge';
if (bridge) {
  message[bridge] = {
    status: status,
    scheduledLift: null
  };
  message.changed.bridge = bridge;
} else {
  message['baileys bridge'] = {
    status: status,
    scheduledLift: null
  };
}

if (scheduled) {
  message.changed.item = 'scheduledLift';
  var todayUTC = Date.now() + 1000 * 60 * 60 * 2;
  var defaultLiftTime = new Date(0);
  defaultLiftTime.setUTCMilliseconds(todayUTC);
  if (bridge) {
    message[bridge].scheduledLift = {
      type:              !status   ? status   : "testing",
      requestTime:       timeStamp.toString(),
      estimatedLiftTime: liftTime ? liftTime : defaultLiftTime
    };
  } else {
    message['baileys bridge'].scheduledLift = {
      type:              !status   ? status   : "testing",
      requestTime:       timeStamp.toString(),
      estimatedLiftTime: liftTime ? liftTime : defaultLiftTime
    };
  }
}
if (othMsgVals.length > 0) {
  message.othMsgVals = othMsgVals;
}

if (hostname) options.hostname = hostname;
if (port)     options.port     = port;
if (path)     options.path     = path;
if (method)   options.method   = method;
if (headers)  options.headers  = headers;

testPost(message, options);
