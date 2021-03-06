module.exports = function (sequelize, DataTypes) {
  var ScheduledEvent = sequelize.define(
    'scheduledEvent',
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
      type: {
        type: DataTypes.STRING,
        allowNull: false
      },
      requestTime: {
        type: DataTypes.DATE,
        allowNull: false
      },
      estimatedLiftTime: {
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
  return ScheduledEvent;
};
