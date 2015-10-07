var argv     = require('minimist')(process.argv.slice(2));

var injector = require('electrolyte');
injector.loader(injector.node('config'));
injector.loader(injector.node('modules'));
injector.loader(injector.node('models/db'));
var mockPost = injector.create('mock-post');
var config   = injector.create('config');
var logger   = injector.create('logger');
var bridges  = config.bridges;

var options     = {};

var bridge      = argv.b || argv.bridge;
var lastFive    = argv.f || argv.five;
var hostname    = argv.h || argv.hostname;
var headers     = argv.H || argv.headers;
var liftTime    = argv.l || argv.liftTime;
var method      = argv.m || argv.method;
var port        = argv.p || argv.port;
var path        = argv.P || argv.path;
var timeStamp   = argv.t || argv.timestamp || new Date().toUTCString();
var status      = argv.s || argv.status;
var scheduled   = argv.S || argv.scheduled;
var type        = argv.T || argv.type;
var othMsgVals  = argv._;

status = (status !== 'false') || false;

if (hostname) options.hostname = hostname;
if (port)     options.port     = port;
if (path)     options.path     = path;
if (method)   options.method   = method;
if (headers)  options.headers  = headers;

var message = bridges;

message.changed.item = 'status';
message.changed.bridge = 'baileys bridge';
if (bridge) {
  message[bridge] = {
    status: status,
    scheduledLifts: [],
    lastFive: []
  };
  message.changed.bridge = bridge;
} else {
  message['baileys bridge'] = {
    status: status,
    scheduledLifts: [],
    lastFive: []
  };
}
if (othMsgVals.length > 0) {
  message.othMsgVals = othMsgVals;
}

if (scheduled) {
 message.changed.item = 'scheduledLifts';
 var today2hrDelay = Date.now() + 1000 * 60 * 60 * 2;
 var defaultLiftTime = new Date(today2hrDelay).toUTCString();
 console.log(timeStamp);
 console.log(defaultLiftTime);
 if (bridge) {
   message[bridge].scheduledLifts.push({
     type:              !status   ? status   : "testing",
     requestTime:       timeStamp,
     estimatedLiftTime: liftTime ? liftTime : defaultLiftTime
   });
 } else {
   message['baileys bridge'].scheduledLifts.push({
     type:              !status   ? status   : "testing",
     requestTime:       timeStamp,
     estimatedLiftTime: liftTime ? liftTime : defaultLiftTime
   });
 }
 mockPost(message, options);
} else if (lastFive) {
  var db       = injector.create('database');
  var ActualEvent = db.actualEvent;
  var Bridge   = db.bridge;
  Bridge.findOne({ where: {
    name: message.changed.bridge
  }}).then(function (bridge) {
    var queryParams = {
      order: 'upTime DESC',
      where: {
        bridgeId: bridge.id
      },
      limit: 5
    };
    ActualEvent.findAll(queryParams)
      .then(function (rows) {
        message[message.changed.bridge].lastFive = rows;
        logger.info(message);
        mockPost(message, options);
      })
      .catch(function (err) {
        logger.info(err);
        logger.info('Could not find events for bridge:', message.changed.bridge);
        message[message.changed.bridge].lastFive = [];
      });
  }).catch(function (err) {
    logger.info(err);
    logger.info('Could not find bridge:', message.changed.bridge);
    message.lastFive = [];
  });
} else {
  mockPost(message, options);
}
