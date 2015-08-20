var
  orm       = require('orm'),
  mySQLCred = require('./config/config').mySQL
;

var options = {
  host     : mySQLCred.host,
  user     : mySQLCred.user,
  password : mySQLCred.password,
  port     : mySQLCred.port,
  database : mySQLCred.database,
  protocol: 'mysql'
};

var db = orm.connect(options, function (err, db) {
  if (err) return err;
  return db;
});

module.exports = db;
