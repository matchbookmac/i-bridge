var
  argv     = require('minimist')(process.argv.slice(2)),
  testPost = require('./mock-post'),
  options  = {}
;
var
  bridge      = argv.b || argv.bridge,
  defaultPath = argv.d || argv.defaultPath,
  hostname    = argv.h || argv.hostname,
  headers     = argv.H || argv.headers,
  liftTime    = argv.l || argv.liftTime,
  method      = argv.m || argv.method,
  port        = argv.p || argv.port,
  path        = argv.P || argv.path,
  timeStamp   = argv.t || argv.timestamp || new Date(),
  status      = argv.s || argv.status,
  scheduled   = argv.S || argv.scheduled,
  type        = argv.T || argv.type,
  othMsgVals  = argv._
;
var message;
if (scheduled) {
  if (defaultPath) path = '/bridges/events/scheduled';
  var todayUTC = Date.now() + 1000 * 60 * 60 * 2;
  var defaultLiftTime = new Date(0);
  defaultLiftTime.setUTCMilliseconds(todayUTC);
  message = {
    bridge:            bridge   ? bridge   : "bailey's bridge",
    type:              status   ? status   : "testing",
    requestTime:       timeStamp.toString(),
    estimatedLiftTime: liftTime ? liftTime : defaultLiftTime
  };
} else {
  if (defaultPath) path = '/bridges/events/actual';
  message = {
    bridge:    bridge    ? bridge    : "bailey's bridge",
    status:    status    ? status    : true,
    timeStamp: timeStamp ? timeStamp : (new Date()).toString()
  };
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
