'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {

    return queryInterface.addColumn('subjects', 'level_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
      after: 'grade_id'
    },

    );
  },

  async down(queryInterface, Sequelize) {

    return queryInterface.removeColumn('subjects', 'level_id');
  }
};
