'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {

    return queryInterface.changeColumn('skills','name', {
        type: Sequelize.STRING,
        allowNull: false
      },
    );
  },

  async down(queryInterface, Sequelize) {

    return queryInterface.changeColumn('skills', 'name');
  }
};
