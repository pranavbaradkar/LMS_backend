'use strict';

const replaceEnum = require('sequelize-replace-enum-postgres').default;

module.exports = {
  async up(queryInterface, Sequelize) {
    return replaceEnum({
      queryInterface,
      tableName: 'user_recommendations',
      columnName: 'status',
      defaultValue: "MAINS_SUBMITTED",
      newValues: ['NOT_SELECTED','SELECTED','INTERVIEW','MAINS_SUBMITTED','MAINS_CLEARED','DEMO_SUBMITTED'],
      enumName: 'enum_user_recommendations_status'
      
    });
  },

  
  async down(queryInterface, Sequelize) {
   
  }
};