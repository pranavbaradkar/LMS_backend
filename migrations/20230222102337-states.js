'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    
     return queryInterface.createTable('states', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
      },
      state_name:{
        type: Sequelize.STRING,
        allowNull: false
      },
      country_id : { 
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
 
     return queryInterface.dropTable('states');
  }
};
