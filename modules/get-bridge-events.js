module.exports = function (request, reply) {
    var
    mySQLCred       = require('../config/config').mySQL,
    wlog           = require('winston'),
    mysql           = require('mysql'),
    getEventsSQL    = 'SELECT * FROM bridge_events',
    connection      = mysql.createConnection({
      host     : mySQLCred.host,
      user     : mySQLCred.user,
      password : mySQLCred.password,
      port     : mySQLCred.port,
      database : mySQLCred.database
    });
  connection.connect(function(err) {
    if (err) {
      console.error('error connecting: ' + err.stack);
      return;
    } else{
      console.log('connected as id ' + connection.threadId);
      var results = connection.query(getEventsSQL, function(err, rows) {
        if(err){
          wlog.info("error: " + err );
        } else {
          console.log('foo');
          reply(rows);
        };
    });
  };
});
};
