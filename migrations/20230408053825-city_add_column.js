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

      await queryInterface.addColumn("cities", "district_id", {
        type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0,
          after: 'country_id'
      });

      await queryInterface.addColumn("cities", "taluka_id", {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        after: 'district_id'
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
