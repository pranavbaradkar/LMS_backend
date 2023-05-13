'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.changeColumn('questions', 'hint', {
          type: Sequelize.TEXT,
          allowNull: false,
      })
  ])
  },

  async down (queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.changeColumn('questions', 'hint', {
          type: Sequelize.STRING,
          allowNull: false,
      })
  ])
  }
};