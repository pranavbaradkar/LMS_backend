"use strict";

// /** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {

    return [
      queryInterface.changeColumn("schools", "total_strength", {
        type: Sequelize.STRING,
        defaultValue: 0
      }),
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
