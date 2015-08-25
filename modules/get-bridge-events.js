module.exports = function (request, reply) {
console.log('boop');
  // var
  //   mySQLCred       = require('../config/config').mySQL,
  //   wlog            = require('winston'),
  //   mysql           = require('mysql'),
  //   getEventsSQL    = 'SELECT bridge_name, up_time, down_time FROM bridge_events ORDER BY up_time;',
  //   connection      = mysql.createConnection({
  //     host     : mySQLCred.host,
  //     user     : mySQLCred.user,
  //     password : mySQLCred.password,
  //     port     : mySQLCred.port,
  //     database : mySQLCred.database
  //   })
  // ;
  // connection.connect(function(err) {
  //   if (err) {
  //     wlog.error('error connecting: ' + err.stack);
  //     return;
  //   } else{
  //     wlog.info('connected as id ' + connection.threadId);
  //     var results = connection.query(
  //       getEventsSQL,
  //       function(err, rows) {
  //         if(err){
  //           wlog.info("error: " + err );
  //         } else {
  //           console.log('foo');
  //           reply(rows);
  //         }
  //       }
  //     );
  //   }
  // });
};
