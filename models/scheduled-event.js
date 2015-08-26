module.exports = function (sequelize, DataTypes) {
  var ScheduledEvent = sequelize.define(
    'ScheduledEvent',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      bridge: {
        type: DataTypes.STRING,
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
