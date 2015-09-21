var fs         = require('fs');
var path       = require('path');
var chalk      = require('chalk');
var currentEnv = require('./config').env;
var strftime   = require('strftime');
var logger;

fs.mkdir(path.resolve(__dirname, '../logs'), function (err) {
  return;
});

if (currentEnv === 'test') {
  // I have no idea why the tests fail when the test-log starts with content
  // in it, but the next line clears the file before initiating the log,
  // after which the tests pass.
  chalk.enabled = false;
  logger = require('tracer').console({
    format: [
      "{{title}}: {{message}} | {{file}}:{{line}}"
    ],
    transport : function(data) {
      var date = new Date(data.timestamp);
      var stream = fs.createWriteStream(path.resolve(__dirname,
        '../logs/test-log.md'),
        { flags: 'w', encoding: 'utf8', mode: 0666 }
      ).write((function (argument) {
        return ('**'+data.title+':** '+
                data.message+' '+
                strftime('%H:%M:%S',date)+' | '+
                data.file+':'+
                data.line+
                "\n"
              );
      })());
    }
  });
} else {
  logger = require('tracer').console({
    format: [
      "{{title}}: {{message}} | {{file}}:{{line}}"
    ],
    preprocess: function (data) {
      switch (data.title) {
        case 'trace':
          data.title = chalk.blue(data.title);
          break;
        case 'debug':
          data.title = chalk.magenta(data.title);
          break;
        case 'info':
          data.title = chalk.green(data.title);
          break;
        case 'warn':
          data.title = chalk.yellow(data.title);
          break;
        case 'error':
          data.title = chalk.red(data.title);
          break;
        default:
          data.title = chalk.white(data.title);
      }
      data.message = chalk.white(data.message);
      data.file = chalk.cyan(data.file);
      data.line = chalk.cyan(data.line);
    },
    transport : function(data) {
      console.log(data.output);
      var date = new Date(chalk.stripColor(data.timestamp));
      var stream = fs.createWriteStream(path.resolve(__dirname,
        '../logs/'+date.getFullYear()+'-'+(date.getMonth()+1)+'-'+date.getDate()+'-info.log'),
        { flags: "a", encoding: "utf8", mode: 0666 }
      ).write((function (argument) {
        return JSON.stringify({
          level: chalk.stripColor(data.title),
          message: chalk.stripColor(data.message),
          timestamp: date.toString(),
        })+"\n";
      })());
    }
  });
}
module.exports = logger;
