'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.addIndex(
      'Users',
      ['email'],
      {
        indicesType: 'UNIQUE'
      }
    );
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.removeIndex(
      'Users',
      ['email']
    );
  }
};
