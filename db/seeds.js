var db = require('../models/index');
var User = db.User;

db.sequelize.sync({force: true}).then(function () {
  User.create({ email: 'user@example.com', token: '1234' }).then(function () {
    return;
  });
}).catch(function (err) {
  console.log('There was an error seeding: ' + err);
});
