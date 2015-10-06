'use strict';

var fs        = require('fs');
var path      = require('path');
var Sequelize = require('sequelize');
var _         = require('lodash');
var Promise   = require('bluebird');

exports = module.exports = function (config, logger) {
  var basename  = path.basename(module.filename);
  var env       = process.env.NODE_ENV || config.env || 'development';
  var dbConfig  = require(__dirname + '/database.json')[env];
  if (env !== 'test') dbConfig.logging = logger.debug;
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

  // Populate lastFive and pending scheduledLifts for each bridge on startup b/c there's not a better place to do this right now
  var bridgeStatuses = config.bridges;
  _.forOwn(bridgeStatuses, function (status, bridgeName) {
    if (bridgeName !== 'changed') {
      Bridge.findOne({
        where: {
          name: bridgeName
        }
      }).then(function (bridge) {
        Promise.all([
          ActualEvent.findAll({
            order: 'upTime DESC',
            where: {
              bridgeId: bridge.id
            },
            limit: 5
          }),
          ScheduledEvent.findAll({
            order: 'estimatedLiftTime DESC',
            where: {
              bridgeId: bridge.id,
              estimatedLiftTime: {
                $gt: new Date()
              }
            }
          })
        ]).then(function (results) {
            bridgeStatuses[bridgeName].lastFive = results[0];
            bridgeStatuses[bridgeName].scheduledLifts = results[1];
          }).catch(errorResponse);
      }).catch(errorResponse);
    }
    function errorResponse(err) {
      logger.error('Problem populating last 5 and scheduledLifts');
    }
  });

  return db;
};

exports['@singleton'] = true;
exports['@require'] = [ 'config', 'logger' ];
