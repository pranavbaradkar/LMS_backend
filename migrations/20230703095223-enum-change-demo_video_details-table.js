'use strict';

const replaceEnum = require('sequelize-replace-enum-postgres').default;

module.exports = {
  async up(queryInterface, Sequelize) {
    return replaceEnum({
      queryInterface,
      tableName: 'demovideo_details',
      columnName: 'status',
      defaultValue: "PENDING",
      newValues: ['PENDING', 'SUBMITTED', 'AI_STATUS_COMPLETED', 'MANUAL_STATUS_COMPLETED','NOT_RECOMMENDED', 'RECOMMENDED','PASSED', 'FAILED'],
      enumName: 'enum_demovideo_details_status'
    });
  },

  
  async down(queryInterface, Sequelize) {
   
  }
};