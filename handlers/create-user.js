var wlog           = require('winston');
var boom           = require('boom');
var crypto         = require('crypto');

var db             = require('../models/index');
var User           = db.User;

module.exports = function (request, reply) {
  var email = request.payload.email;
  crypto.randomBytes(20, function(ex, buf) {
    if (ex) throw ex;
    var token = buf.toString('hex');
    User.create({ email: email, token: token })
        .then(function (user) {
          var response = reply(user);
          response.created('/bridges');
        })
        .catch(function (err) {
          var error = boom.badRequest(err);
          var context = { message: 'e-mail already taken, please try again'};
          var response = reply.view('new-user', context);
          response.location('/users/new');
        });
  });
};
