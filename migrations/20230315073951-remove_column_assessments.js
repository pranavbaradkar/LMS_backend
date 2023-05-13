'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {

    return [
      queryInterface.removeColumn('assessments', 'negative_marking'),
      queryInterface.removeColumn('assessments', 'time_based_on'),
      queryInterface.removeColumn('assessments', 'total_no_questions'),
      queryInterface.removeColumn('assessments', 'display_result'),
      queryInterface.removeColumn('assessments', 'randomize_questions'),
      queryInterface.removeColumn('assessments', 'shuffle_questions'),
      queryInterface.removeColumn('assessments', 'display_correct_answer'),
      queryInterface.removeColumn('assessments', 'start_date'),
      queryInterface.removeColumn('assessments', 'end_date'),
      queryInterface.removeColumn('assessments', 'marks_obtained'),
      queryInterface.removeColumn('assessments', 'question'),
    ]

  },

  async down (queryInterface, Sequelize) {
    
  }
};
