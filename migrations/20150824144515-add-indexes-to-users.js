'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.addIndex(
      'users',
      ['email'],
      {
        indicesType: 'UNIQUE'
      }
    );
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.removeIndex(
      'users',
      ['email']
    );
  }
};
