'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('user_recommendations', {
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
      screening_score : { 
        type: Sequelize.INTEGER, 
        allowNull: true
      },
      screening_score_total : { 
        type: Sequelize.INTEGER, 
        allowNull: true
      },
      mains_score : { 
        type: Sequelize.INTEGER, 
        allowNull: true
      },
      mains_score_total : { 
        type: Sequelize.INTEGER, 
        allowNull: true
      },
      demo_score : { 
        type: Sequelize.INTEGER, 
        allowNull: true
      },
      demo_score_total : { 
        type: Sequelize.INTEGER, 
        allowNull: true
      },
      interview_score : { 
        type: Sequelize.INTEGER, 
        allowNull: true
      },
      interview_score_total : { 
        type: Sequelize.INTEGER, 
        allowNull: true
      },
      ai_recommendation : { 
        type: Sequelize.STRING, 
        allowNull: true 
      },
      status : { 
        type: Sequelize.ENUM('AGREE', 'DISAGREE', 'PENDING'), 
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
    return queryInterface.dropTable('user_recommendations');
  }
};