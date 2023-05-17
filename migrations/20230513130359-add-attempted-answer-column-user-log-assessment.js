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
      queryInterface.addColumn('user_assessment_logs', 'answered_question', {
        type: Sequelize.TEXT,
        allowNull: true,
        after: 'assessment_id',
        defaultValue: null
      }),
      queryInterface.removeColumn('user_assessment_logs', 'question_id'),
      queryInterface.removeColumn('user_assessment_logs', 'question_status')
    ];
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    return queryInterface.removeColumn('user_assessment_logs', 'answered_question');
  }
};