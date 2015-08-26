'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.addIndex(
      'Users',
      ['token'],
      {
        indicesType: 'UNIQUE'
      }
    );
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.removeIndex(
      'Users',
      ['token']
    );
  }
};
