'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.addIndex(
      'users',
      ['token'],
      {
        indicesType: 'UNIQUE'
      }
    );
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.removeIndex(
      'users',
      ['token']
    );
  }
};
