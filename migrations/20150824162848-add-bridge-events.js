'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.createTable(
      'BridgeEvents',
      {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        name: {
          type: Sequelize.STRING,
          allowNull: false
        },
        up_time: {
          type: Sequelize.DATE,
          allowNull: false
        },
        down_time: {
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
    return queryInterface.dropTable('BridgeEvents');
  }
};
