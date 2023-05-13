'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    return [
      await queryInterface.addColumn('users', 'country_name', {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null,
        after: 'country_id'
      }),
      await queryInterface.addColumn('users', 'state_name', {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null,
        after: 'state_id'
      }),
      await queryInterface.addColumn('users', 'city_name', {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null,
        after: 'city_id'
      }),
      await queryInterface.addColumn('users', 'district_name', {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null,
        after: 'city_name'
      }),
      await queryInterface.addColumn('users', 'taluka_name', {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null,
        after: 'district_name'
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
