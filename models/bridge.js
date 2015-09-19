var wlog = require('winston');

module.exports = function (sequelize, DataTypes) {
  var Bridge = sequelize.define(
    'bridge',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      totalUpTime: {
        type: DataTypes.FLOAT,
        defaultVaule: 0.0
      },
      avgUpTime: {
        type: DataTypes.FLOAT,
        defaultVaule: 0.0
      },
      actualCount: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      scheduledCount: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      createdAt: {
        type: DataTypes.DATE
      },
      updatedAt: {
        type: DataTypes.DATE
      }
    }
  );
  return Bridge;
};
