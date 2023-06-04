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
    queryInterface.changeColumn('lo_banks', 'lo_text', { type: Sequelize.TEXT, allowNull: false, defaultValue: "" }),
    queryInterface.changeColumn('topics', 'topic_text', { type: Sequelize.TEXT, allowNull: false, defaultValue: "" }),
    queryInterface.changeColumn('sub_strands', 'sub_strand_text', { type: Sequelize.TEXT, allowNull: false, defaultValue: "" }),
    queryInterface.changeColumn('lo_questions', 'correct_answer', { type: Sequelize.TEXT, allowNull: false, defaultValue: "" }),
    queryInterface.changeColumn('lo_question_options', 'correct_answer', { type: Sequelize.TEXT, allowNull: true, defaultValue: "" }),
  ];
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};


