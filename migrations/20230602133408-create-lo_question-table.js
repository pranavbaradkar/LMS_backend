'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('lo_questions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      level_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      grade_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      subject_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      question_type: {
        type: Sequelize.ENUM('SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'FILL_IN_THE_BLANKS', 'TRUE_FALSE', 'MATCH_THE_FOLLOWING'),
        allowNull: false
      },
      statement: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      mime_type: {
        type: Sequelize.STRING,
        allowNull: true
      },
      s3url: {
        type: Sequelize.STRING,
        allowNull: true
      },
      correct_answer: {
        type: Sequelize.STRING,
        allowNull: false
      },
      answer_explanation: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      blooms_taxonomy: {
        type: Sequelize.ENUM('REMEMBER', 'UNDERSTAND', 'APPLY', 'ANALYZE', 'EVALUTE', 'CREATE'),
        allowNull: false,
      },
      difficulty_level: {
        type: Sequelize.ENUM('EASY', 'MEDIUM', 'HARD', 'VERY_HARD'),
        allowNull: false,
      },
      complexity_level: {
        type: Sequelize.ENUM('P1', 'P2', 'P3', 'P4', 'P5'),
        allowNull: false,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      deleted_at: {
        allowNull: true,
        defaultValue: null,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('lo_questions');
  }
};