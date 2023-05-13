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
    return [
      queryInterface.sequelize.transaction(async (transaction) => {
        await queryInterface.addColumn('countries', 'country_code', {
          type: Sequelize.STRING(5),
          allowNull: true,
          defaultValue: null,
          after: 'country_name'
        });
      }),
      queryInterface.sequelize.transaction(async (transaction) => {
        await queryInterface.addColumn('countries', 'iso_code', {
          type: Sequelize.STRING(5),
          allowNull: true,
          defaultValue: null,
          after: 'country_code'
        })
      })
    ]
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
