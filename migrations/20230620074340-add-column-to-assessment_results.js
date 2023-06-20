'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    return  [
      queryInterface.addColumn('assessment_results', 'total', { type: Sequelize.INTEGER, allowNull: true }),
      queryInterface.addColumn('assessment_results', 'total_scored', { type: Sequelize.INTEGER, allowNull: true }),
    ];
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    return [
      queryInterface.removeColumn('assessment_results', 'total'),
      queryInterface.removeColumn('assessment_results', 'total_scored')
    ]
  }
};

 