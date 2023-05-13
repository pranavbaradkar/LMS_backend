'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {

    return queryInterface.addColumn('users','step', {
      
        type: Sequelize.SMALLINT,
        allowNull: false,
        defaultValue: 1,
        after: 'longitude'
      },
    );
  },

  async down(queryInterface, Sequelize) {

    return queryInterface.addColumn('users', 'step');
  }
};
