'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {

    return queryInterface.addColumn('grades', 'subject_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
      after: 'board_id'
    },

    );
  },

  async down(queryInterface, Sequelize) {

    return queryInterface.removeColumn('grades', 'subject_id');
  }
};
