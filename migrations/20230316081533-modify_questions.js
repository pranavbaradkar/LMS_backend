'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {

    return [
      queryInterface.removeColumn('questions', 'name'),
      queryInterface.renameColumn('questions', 'question_description', 'statement'),
      queryInterface.renameColumn('questions', 'tag', 'tags'),
    ]
  },

  async down(queryInterface, Sequelize) {
      
  }
};