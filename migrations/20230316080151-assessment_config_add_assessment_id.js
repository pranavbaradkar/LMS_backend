'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {

    return queryInterface.addColumn('assessment_configurations', 'assessment_id', {
        type: Sequelize.INTEGER,
        allowNull: false,
        after: 'id'
    });
  },
  async down(queryInterface, Sequelize) {
  }
};