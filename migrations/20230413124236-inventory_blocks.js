'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    
     return queryInterface.createTable('inventory_blocks', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
      },
      user_id:{
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: null
      },
      code:{
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0
      },
      inventory_type:{
        type: Sequelize.ENUM("LAPTOP", "LAPTOP_WITH_CAMERA", "PC", "PC_WITH_CAMERA"),
        allowNull: false,
        defaultValue: 'LAPTOP'
      },
      status:{
        type: Sequelize.ENUM("BLOCKED", "RELEASED"),
        allowNull: false,
        defaultValue: 'BLOCKED'
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      deleted_at: {
        allowNull: true,
        type: Sequelize.DATE
      },
    });
  },

  async down (queryInterface, Sequelize) {
 
     return queryInterface.dropTable('Inventory_blocks');
  }
};         