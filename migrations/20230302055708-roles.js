'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    
     return queryInterface.createTable('roles', {
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
      note:{
        type: Sequelize.TEXT,
        allowNull: false
      },
      permission : {  
        type: Sequelize.TEXT, 
        allowNull:false
      },
      is_default : {  
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
 
     return queryInterface.dropTable('roles');
  }
};
