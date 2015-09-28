'use strict';

var fs        = require('fs');
var path      = require('path');
var Sequelize = require('sequelize');

exports = module.exports = function (config, logger) {
  var basename  = path.basename(module.filename);
  var env       = process.env.NODE_ENV || config.env || 'development';
  var dbConfig  = require(__dirname + '/database.json')[env];
  if (env === 'development') dbConfig.logging = logger.debug;
  var sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, dbConfig);
  var db        = {};
  fs.readdirSync(path.resolve(__dirname, '..'))
    .filter(function(file) {
      return (file.indexOf('.') !== 0) && (file !== basename);
    })
    .forEach(function(file) {
      if (file.slice(-3) !== '.js') return;
      var model = sequelize['import'](path.join(path.resolve(__dirname, '..'), file));
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
exports['@require'] = [ 'config', 'logger' ];
