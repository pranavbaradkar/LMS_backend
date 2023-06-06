'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */

    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.renameColumn("professional_infos", "experience_year", "experience_min", {
        transaction
      });
      await queryInterface.renameColumn("professional_infos", "experience_month", "experience_max", {
        transaction
      });
    });
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};
