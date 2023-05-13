"use strict";

// /** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return [
      queryInterface.addColumn("professional_infos", "start_date", {
        type: Sequelize.DATEONLY,
        allowNull: false,
        defaultValue: new Date()
      }),
      queryInterface.addColumn("professional_infos", "end_date", {
        type: Sequelize.DATEONLY,
        allowNull: true
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
