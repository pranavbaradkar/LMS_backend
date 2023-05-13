"use strict";

// /** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {

    return [
      queryInterface.addColumn("schools", "country_id", {
        type: Sequelize.INTEGER,
        allowNull: false,
      }),
      queryInterface.addColumn("schools", "state_id", {
        type: Sequelize.INTEGER,
        allowNull: false,
      }),
      queryInterface.addColumn("schools", "city_id", {
        type: Sequelize.INTEGER,
        allowNull: false,
      }),
      queryInterface.changeColumn("schools", "cluster_id", {
        type: Sequelize.INTEGER,
        allowNull: true,
      }),
      queryInterface.changeColumn("schools", "brand_id", {
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
