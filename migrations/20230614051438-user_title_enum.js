'use strict';

const replaceEnum = require('sequelize-replace-enum-postgres').default;

module.exports = {
  async up(queryInterface, Sequelize) {
    return replaceEnum({
      queryInterface,
      tableName: 'users',
      columnName: 'title',
      defaultValue: "Ms",
      newValues: ["Ms", "Mrs", "Mr", "Miss"],
      enumName: 'enum_users_title'
    });
  },

  async down(queryInterface, Sequelize) {
   
  }
};