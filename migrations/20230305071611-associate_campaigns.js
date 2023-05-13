'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    
     return queryInterface.createTable('associate_campaigns', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
      },
      campaign_id : { 
        type: Sequelize.INTEGER, 
        allowNull:false
      },
      assessment_id : { 
        type: Sequelize.INTEGER, 
        allowNull:false
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
 
     return queryInterface.dropTable('associate_campaigns');
  }
};
