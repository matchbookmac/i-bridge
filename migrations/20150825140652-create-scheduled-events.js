'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.createTable(
      'ScheduledEvents',
      {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        bridge: {
          type: Sequelize.STRING,
          allowNull: false
        },
        type: {
          type: Sequelize.STRING,
          allowNull: false
        },
        requestTime: {
          type: Sequelize.DATE,
          allowNull: false
        },
        estimatedLiftTime: {
          type: Sequelize.DATE,
          allowNull: false
        },
        createdAt: {
          type: Sequelize.DATE
        },
        updatedAt: {
          type: Sequelize.DATE
        }
      }
    );
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.dropTable('ScheduledEvents');
  }
};
