'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('psy_question_options', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      psy_question_id : { 
        type: Sequelize.BIGINT, 
        allowNull: false
      },
      option_key : { 
        type: Sequelize.TEXT, 
        allowNull: false
      },
      option_value : { 
        type: Sequelize.TEXT, 
        allowNull: false 
      },
      score_value : { 
        type: Sequelize.INTEGER, 
        allowNull: true 
      },
      option_type : { 
        type: Sequelize.ENUM('IMAGE', 'TEXT', 'SEQUENCE', 'AUDIO', 'VIDEO'), 
        defaultValue: 'TEXT'
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
    return queryInterface.dropTable('psy_question_options');
  }
};