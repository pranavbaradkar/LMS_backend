"use strict";

// /** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {

    return queryInterface.changeColumn("brands", "cluster_id", {
      type: 'INTEGER using CAST("cluster_id" as INTEGER)',
      allowNull: true
    })

  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    return queryInterface.removeColumn("brands", "cluster_id");
  }
};
