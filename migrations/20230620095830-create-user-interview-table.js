'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('user_interviews', {
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
      date_time : { 
        type: 'TIMESTAMP', 
        allowNull: true
      },
      mode : { 
        type: Sequelize.STRING, 
        allowNull: true
      },
      room_no : { 
        type: Sequelize.STRING, 
        allowNull: true
      },
      status : { 
        type: Sequelize.ENUM('PENDING','NOT_RECOMMENDED', 'RECOMMENDED'), 
        defaultValue: 'PENDING'
      },
      interviewer : { 
        type: Sequelize.STRING, 
        allowNull: true
      },
      interview_remark : { 
        type: Sequelize.TEXT, 
        allowNull: true
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
    return queryInterface.dropTable('psy_question_options');
  }
};