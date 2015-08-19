var
  wlog       = require('winston'),
  fs         = require('fs'),
  path       = require('path'),
  currentEnv = require('./config').env
;

wlog.remove(wlog.transports.Console);
if (currentEnv !== 'test') {
  wlog.add(wlog.transports.Console, {
    colorize: true
  });
  wlog.add(wlog.transports.File, {
    name: 'info-file',
    colorize: true,
    filename: 'logs/info-log.log',
    timestamp: function () {
      return (new Date()).toString();
    },
    level: 'info'
  });
  wlog.add(wlog.transports.File, {
    name: 'error-file',
    colorize: true,
    filename: 'logs/error-log.log',
    timestamp: function () {
      return (new Date()).toString();
    },
    level: 'error'
  });
} else {
  // I have no idea why the tests fail when the test-log starts with content
  // in it, but the next line clears the file before initiating the log,
  // after which the tests pass.
  fs.truncateSync(path.resolve('logs/test-log.log'), 0);
  wlog.add(wlog.transports.File, {
    name: 'test-file',
    colorize: true,
    filename: 'logs/test-log.log',
    timestamp: function () {
      return (new Date()).toString();
    }
  });
  wlog.add(wlog.transports.Console, {
    colorize: true,
    silent: true
  });
}
