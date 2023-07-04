'use strict';

const replaceEnum = require('sequelize-replace-enum-postgres').default;

module.exports = {
  async up(queryInterface, Sequelize) {
    return replaceEnum({
      queryInterface,
      tableName: 'user_recommendations',
      columnName: 'status',
      defaultValue: "PENDING",
      newValues: ['NOT_SELECTED','SELECTED','INTERVIEW','MAINS_FAILED','MAINS_CLEARED','DEMO_SUBMITTED','PENDING'],
      enumName: 'enum_user_recommendations_status'
      
    });
  },

  
  async down(queryInterface, Sequelize) {
   
  }
};