'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {

    return queryInterface.createTable('assessment_configurations', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
      },
      skill_distributions: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      difficulty_level: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      total_no_of_questions: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      level_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      correct_score_answer: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      negative_marking: {
        type: Sequelize.ENUM('YES', 'NO'),
        allowNull: false,
        defaultValue: 'NO'
      },
      duration_of_assessment: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      randomize_questions: {
        type: Sequelize.ENUM('YES', 'NO'),
        allowNull: false,
        defaultValue: 'NO'
      },
      shuffle_questions: {
        type: Sequelize.ENUM('YES', 'NO'),
        allowNull: false,
        defaultValue: 'NO'
      },
      display_correct_answer: {
        type: Sequelize.ENUM('YES', 'NO'),
        allowNull: false,
        defaultValue: 'NO'
      },
      display_result: {
        type: Sequelize.ENUM('YES', 'NO'),
        allowNull: false, 
        defaultValue: 'NO'
      },
      passing_criteria: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      time_up_first_remainder: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      time_up_last_remainder: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      assessment_type: {
        type: Sequelize.ENUM('SCREENING', 'MAINS'),
        allowNull: false, 
        defaultValue: 'SCREENING'
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });
  },

  async down(queryInterface, Sequelize) {

    return queryInterface.dropTable('assessment_configurations');
  }
};