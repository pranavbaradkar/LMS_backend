'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    
     return queryInterface.createTable('user_assessments', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
      },
      user_id:{
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      assessment_id:{
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      screening_status:{
        type: Sequelize.ENUM('STARTED', 'INPROGRESS', 'FINISHED', 'PASSED', 'FAILED', 'ABORTED'),
        defaultValue: 'STARTED',
      },
      mains_status : {
        type: Sequelize.ENUM('PENDING','STARTED', 'INPROGRESS', 'FINISHED', 'PASSED', 'FAILED', 'ABORTED'),
        defaultValue: 'PENDING',
      },
      screening_result_notified:{
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      mains_result_notified :{
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });
  },

  async down (queryInterface, Sequelize) {
 
     return queryInterface.dropTable('user_assessments');
  }
};