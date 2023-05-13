'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('question_mtf_answers', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      question_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      answer_key: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      answer_value: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      answer_type: {
        type: Sequelize.ENUM('IMAGE', 'TEXT', 'SEQUENCE', 'AUDIO', 'VIDEO'),
        allowNull: false
      },
      answer_uuid: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null
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
    return queryInterface.dropTable('question_mtf_answers');
  }
};