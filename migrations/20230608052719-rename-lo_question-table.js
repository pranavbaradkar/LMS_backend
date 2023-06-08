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
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.renameTable('questions', 'old_questions', {
        transaction
      });
      await queryInterface.renameTable('question_options', 'old_question_options', {
        transaction
      });

      await queryInterface.renameTable('lo_questions', 'questions', {
        transaction
      });
      await queryInterface.renameTable('lo_question_options', 'question_options', {
        transaction
      });
      await queryInterface.renameColumn("question_options", "lo_question_id", "question_id", {
        transaction
      });
    });
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.renameColumn("question_options", "question_id", "lo_question_id", {
        transaction
      });
      await queryInterface.renameTable('question_options', 'lo_question_options',{
        transaction
      });
      await queryInterface.renameTable('questions', 'lo_questions',{
        transaction
      });

      await queryInterface.renameTable('old_question_options', 'question_options',{
        transaction
      });
      await queryInterface.renameTable('old_questions', 'questions',{
        transaction
      });

    });
  }
};
