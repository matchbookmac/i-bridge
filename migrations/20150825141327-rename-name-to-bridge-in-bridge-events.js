'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.renameColumn('BridgeEvents', 'name', 'bridge');
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.renameColumn('BridgeEvents', 'bridge', 'name');
  }
};
