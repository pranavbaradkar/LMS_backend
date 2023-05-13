"use strict";

// /** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {

    return [
      queryInterface.changeColumn("grades", "level_id", {
        type: Sequelize.INTEGER,
        allowNull: true,
      }),
      queryInterface.changeColumn("grades", "board_id", {
        type: Sequelize.INTEGER,
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
