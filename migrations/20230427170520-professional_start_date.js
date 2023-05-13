"use strict";

// /** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return [
      queryInterface.changeColumn("professional_infos", "start_date", {
        type: Sequelize.DATEONLY,
        allowNull: true,
        defaultValue: null 
      }),
      queryInterface.changeColumn("professional_infos", "end_date", {
        type: Sequelize.DATEONLY,
        allowNull: true,
        defaultValue: null
      })
    ];
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
