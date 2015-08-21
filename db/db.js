var
  orm       = require('orm'),
  wlog      = require('winston'),
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
  if (err) {
    wlog.info("MYSQL connection error: " + err.code);
    wlog.info("MYSQL connection error fatal?: " + err.fatal);
    return;
  }
  else{
    wlog.info("MYSQL connection: successful. ");
    return db;
  }
});

module.exports.User = db.define('user', {
  id:    { type: 'serial', key: true },
  email: { type: 'text' },
  token: { type: 'text' }
}, {
  methods: {
    findWithToken: function (token) {
      this.find({ token: token }, function (err, results) {
        if (err) return err;
        return results;
      });
    }
  }
});

module.exports = db;
