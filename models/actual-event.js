module.exports = function (sequelize, DataTypes) {
  var ActualEvent = sequelize.define(
    'actualEvent',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      bridgeId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      upTime: {
        type: DataTypes.DATE,
        allowNull: false
      },
      downTime: {
        type: DataTypes.DATE,
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
  return ActualEvent;
};
