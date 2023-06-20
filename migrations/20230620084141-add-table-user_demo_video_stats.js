'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('demovideo_details', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id : { 
        type: Sequelize.INTEGER, 
        allowNull: false
      },
      video_link : { 
        type: Sequelize.TEXT, 
        allowNull: true
      },
      demo_topic : { 
        type: Sequelize.STRING, 
        allowNull: false 
      },
      demo_description : { 
        type: Sequelize.TEXT, 
        allowNull: true
      },
      scores : { 
        type: Sequelize.TEXT, 
        allowNull: true,
        defaultValue: '[{"knowledge_score":0,"total":10},{"confidence_score":0,"total":10},{"behavioral_score":0,"total":10},{"fluency_score":0,"total":10}]'
      },
      status : { 
        type: Sequelize.ENUM('PENDING','NOT_RECOMMENDED', 'RECOMMENDED'), 
        defaultValue: 'PENDING'
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