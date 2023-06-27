'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('user_interview_feedbacks', {
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
      assessment_id : { 
        type: Sequelize.INTEGER, 
        allowNull: true
      },
      about_candidate : { 
        type: Sequelize.TEXT, 
        allowNull: true
      },
      candidate_past : { 
        type: Sequelize.TEXT, 
        allowNull: true
      },
      ctc_current : { 
        type: Sequelize.STRING, 
        allowNull: true
      },
      ctc_expected : { 
        type: Sequelize.STRING, 
        allowNull: true
      },
      teaching_grades : { 
        type: Sequelize.JSONB, 
        allowNull: true
      },
      teaching_boards : { 
        type: Sequelize.JSONB, 
        allowNull: true
      },
      confidence_score : { 
        type: Sequelize.INTEGER, 
        allowNull: true
      },
      appearence_score : { 
        type: Sequelize.INTEGER, 
        allowNull: true
      },
      overall_rating : { 
        type: Sequelize.INTEGER, 
        allowNull: true
      },
      offer_selection : { 
        type: Sequelize.ENUM('YES','NO', 'MAYBE'), 
        allowNull: true,
        defaultValue: null,
      },
      interview_notes : { 
        type: Sequelize.TEXT, 
        allowNull: true
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
    return queryInterface.dropTable('user_interview_feedbacks');
  }
};