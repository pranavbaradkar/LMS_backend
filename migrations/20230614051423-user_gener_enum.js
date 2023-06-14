'use strict';

const replaceEnum = require('sequelize-replace-enum-postgres').default;

module.exports = {
  async up(queryInterface, Sequelize) {
    return replaceEnum({
      queryInterface,
      tableName: 'users',
      columnName: 'gender',
      newValues: ["MALE", "FEMALE", "OTHERS"],
      enumName: 'enum_personal_infos_gender'
    });
  },

  async down(queryInterface, Sequelize) {
   
  }
};