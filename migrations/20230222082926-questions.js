'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('questions', {
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
      question_type: {
        type: Sequelize.ENUM('SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'FILL_IN_THE_BLANKS', 'TRUE_FALSE', 'MATCH_THE_FOLLOWING'),
        allowNull: false,
      },
      question_description: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      answer_explanation: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      hint: {
        type: Sequelize.STRING,
        allowNull: false
      },
      correct_answer:{
        type: Sequelize.STRING,
        allowNull: false
      },
      difficulty_level:{
        type: Sequelize.ENUM('EASY', 'MEDIUM', 'HIGH', 'VERY_HIGH'),
        allowNull: false,
      },
      complexity_level:{
        type: Sequelize.ENUM('P1', 'P2', 'P3', 'P4', 'P5'),
        allowNull: false,
      },
      knowledge_level:{
        type: Sequelize.ENUM('MUST_KNOW', 'SHOULD_KNOW', 'NICE_TO_KNOW'),
        allowNull: false,
      },
      blooms_taxonomy:{
        type: Sequelize.ENUM('REMEMBER', 'UNDERSTAND', 'APPLY', 'ANALYZE', 'EVALUTE', 'CREATE'),
        allowNull: false,
      },
      learning_objective_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      skill_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      estimated_time: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      correct_answer_score:{
        type: Sequelize.FLOAT(5,2),
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
    return queryInterface.dropTable('questions');
  }
};