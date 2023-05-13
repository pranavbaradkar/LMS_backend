'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    
     return queryInterface.createTable('user_assessment_response', {
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
      response_json: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      type:{
        type: Sequelize.ENUM('SCREENING', 'MAINS'),
        defaultValue: 'SCREENING',
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
 
     return queryInterface.dropTable('user_assessment_response');
  }
};
