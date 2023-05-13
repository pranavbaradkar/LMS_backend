'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    
     return queryInterface.createTable('schools', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
      },
      name:{
        type: Sequelize.STRING,
        allowNull: false
      },
      brand_id:{
        type: Sequelize.INTEGER,
        allowNull: false
      },
      address:{
        type: Sequelize.TEXT,
        allowNull: false
      },
      contact:{
        type: Sequelize.STRING,
        allowNull: false
      },
      website:{
        type: Sequelize.TEXT,
        allowNull: false
      },
      total_strength:{
        type: Sequelize.INTEGER,
        allowNull: false
      },
      cluster_id:{
        type: Sequelize.INTEGER,
        allowNull: false
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
 
     return queryInterface.dropTable('schools');
  }
};
