'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    
     return queryInterface.createTable('boards', {
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
      logo:{
        type: Sequelize.TEXT,
        allowNull: false
      },
      type:{
        type: Sequelize.ENUM('NATIONAL','INTERNATIONAL','STATE'),
        allowNull: false
      },
      school_id:{
        type: Sequelize.INTEGER,
        default: null,
        allowNull: true
      },
      brand_id:{
        type: Sequelize.INTEGER,
        default: null,
        allowNull: true
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
 
     return queryInterface.dropTable('boards');
  }
};

