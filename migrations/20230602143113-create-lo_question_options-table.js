'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('lo_question_options', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      lo_question_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      option_key: {
        type: Sequelize.STRING,
        allowNull: false
      },
      option_value: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      option_type: {
        type: Sequelize.ENUM('IMAGE', 'TEXT', 'SEQUENCE', 'AUDIO', 'VIDEO'),
        allowNull: false
      },
      is_correct: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      correct_answer: {
        type: Sequelize.STRING,
        allowNull: true,
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
    return queryInterface.dropTable('lo_question_options');
  }
};