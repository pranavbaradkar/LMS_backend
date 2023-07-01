'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('interviewers', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name : { 
        type: Sequelize.STRING, 
        allowNull: false
      },
      email : { 
        type: Sequelize.STRING, 
        allowNull: true
      },
      interview_slot : { 
        type: 'TIMESTAMP', 
        allowNull: true,
        defaultValue: null
      },
      school_id : { 
        type: Sequelize.INTEGER, 
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
    return queryInterface.dropTable('interviewers');
  }
};