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
    return [
      queryInterface.addColumn('user_assessments', 'status', {
        type: Sequelize.ENUM('STARTED', 'PENDING', 'INPROGRESS', 'FINISHED', 'PASSED', 'FAILED', 'ABORTED'),
        allowNull: true,
        after: 'screening_status',
        defaultValue: 'PENDING'
      }),
      queryInterface.addColumn('user_assessments', 'type', {
        type: Sequelize.ENUM('SCREENING', 'MAINS'),
        allowNull: true,
        after: 'screening_status',
        defaultValue: null
      }),
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
      queryInterface.removeColumn('user_assessments', 'status'),
      queryInterface.removeColumn('user_assessments', 'type')
    ];
  }
};