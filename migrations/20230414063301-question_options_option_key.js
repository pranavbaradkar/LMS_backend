'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.changeColumn('question_options', 'option_key', {
          type: Sequelize.TEXT,
          allowNull: false,
      })
  ])
  },

  async down (queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.changeColumn('question_options', 'option_key', {
          type: Sequelize.STRING,
          allowNull: false,
      })
  ])
  }
};