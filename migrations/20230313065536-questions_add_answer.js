"use strict";

// /** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {

    return [
      queryInterface.addColumn("questions", "answer", {
        type: Sequelize.STRING,
        allowNull: true,
      }),
      queryInterface.addColumn("questions", "level_id", {
        type: Sequelize.INTEGER,
        allowNull: true,
      }),
      queryInterface.addColumn("questions", "tag", {
        type: Sequelize.TEXT,
        allowNull: true,
      })
    ]

  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};
