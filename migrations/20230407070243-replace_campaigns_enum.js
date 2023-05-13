'use strict';

const replaceEnum = require('sequelize-replace-enum-postgres').default;

module.exports = {
  async up(queryInterface, Sequelize) {
    return replaceEnum({
      queryInterface,
      tableName: 'campaigns',
      columnName: 'audience_type',
      defaultValue: 'TEACHER',
      newValues: ["TEACHER", "JOB_SEEKER"],
      enumName: 'enum_campaigns_audience_type'
    });
  },

  async down(queryInterface, Sequelize) {
    return replaceEnum({
      queryInterface,
      tableName: 'campaigns',
      columnName: 'audience_type',
      defaultValue: 'TEACHER',
      newValues: ["TEACHER", "JOB_SEEKER"],
      enumName: 'enum_campaigns_audience_type'
    });
  }
};