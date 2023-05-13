'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    
     return queryInterface.createTable('cities', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
      },
      city_name:{
        type: Sequelize.STRING,
        allowNull: false
      },
      state_id : { 
        type: Sequelize.INTEGER, 
        allowNull:false
      },
      country_id : { 
        type: Sequelize.INTEGER, 
        allowNull:false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },

  async down (queryInterface, Sequelize) {
 
     return queryInterface.dropTable('cities');
  }
};
