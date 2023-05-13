'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    
     return queryInterface.createTable('school_inventories', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
      },
      code:{
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0
      },
      no_of_computer_labs:{
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0
      },
      lab_school_hours_available:{
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0
      },
      lab_after_school_hours_available:{
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0
      },
      no_of_laptop_labs:{
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0
      },
      no_of_laptop_camera_labs:{
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0
      },
      no_of_pc_labs:{
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0
      },
      no_of_pc_camera_labs:{
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0
      },
      default_browser:{
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null
      },
      internet_bandwidth:{
        type: Sequelize.ENUM("0-40", "40-50", "50-100", "100-200"),
        allowNull: false,
        defaultValue: '0-40'
      },
      ups_backup:{
        type: Sequelize.ENUM("AVAILABLE", "NOT_AVAILABLE"),
        allowNull: true,
        defaultValue: "AVAILABLE"
      },
      duration_ups_backup:{
        type: Sequelize.FLOAT,
        allowNull: true,
      },
      dg_system:{
        type: Sequelize.ENUM("AVAILABLE", "NOT_AVAILABLE"),
        allowNull: true,
        defaultValue: "AVAILABLE"
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updated_at: {
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
 
     return queryInterface.dropTable('school_inventories');
  }
};         