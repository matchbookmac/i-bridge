'use strict';

var fs        = require('fs');
var path      = require('path');
var Sequelize = require('sequelize');
var basename  = path.basename(module.filename);
var env       = process.env.NODE_ENV || require('../config/config').env || 'development';
var dbConfig  = require(__dirname + '/../db/database.json')[env];

exports = module.exports = function (logger) {
  if (env === 'development') dbConfig.logging = logger.debug;
  var sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, dbConfig);
  var db        = {};
  console.log(env);

  fs.readdirSync(__dirname)
    .filter(function(file) {
      return (file.indexOf('.') !== 0) && (file !== basename);
    })
    .forEach(function(file) {
      if (file.slice(-3) !== '.js') return;
      var model = sequelize['import'](path.join(__dirname, file));
      db[model.name] = model;
    });

  Object.keys(db).forEach(function(modelName) {
    if (db[modelName].associate) {
      db[modelName].associate(db);
    }
  });

  db.sequelize = sequelize;
  db.Sequelize = Sequelize;

  var Bridge = db.bridge;
  var ActualEvent = db.actualEvent;
  var ScheduledEvent = db.scheduledEvent;
  Bridge.hasMany(ActualEvent);
  Bridge.hasMany(ScheduledEvent);
  return db;
};

exports['@singleton'] = true;
exports['@require'] = [ 'logger' ];
