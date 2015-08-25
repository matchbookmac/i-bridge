'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.renameColumn('bridgeEvents', 'name', 'bridge');
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.renameColumn('bridgeEvents', 'bridge', 'name');
  }
};
