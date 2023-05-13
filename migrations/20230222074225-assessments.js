'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('assessments', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      score_type: {
        type: Sequelize.ENUM('QUESTION', 'ASSESSMENT'),
        allowNull: false
      },
      negative_marking: {
        type: Sequelize.ENUM('YES', 'NO'),
        allowNull: false
      },
      time_based_on: {
        type: Sequelize.ENUM('QUESTION', 'ASSESSMENT'),
        allowNull: false
      },
      total_no_questions: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      display_result: {
        type: Sequelize.ENUM('YES', 'NO'),
        allowNull: false
      },
      randomize_questions: {
        type: Sequelize.ENUM('YES', 'NO'),
        allowNull: false
      },
      shuffle_questions: {
        type: Sequelize.ENUM('YES', 'NO'),
        allowNull: false
      },
      display_correct_answer: {
        type: Sequelize.ENUM('YES', 'NO'),
        allowNull: false
      },
      start_date: {
        allowNull: false,
        type: Sequelize.DATE
      },
      end_date: {
        allowNull: false,
        type: Sequelize.DATE
      },
      marks_obtained: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      question: {
        type: Sequelize.ENUM('ADD', 'AUTO_SELECT'),
        allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('assessments');
  }
};