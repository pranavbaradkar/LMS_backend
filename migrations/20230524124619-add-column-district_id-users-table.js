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
      queryInterface.addColumn('users', 'district_id', {
        type: Sequelize.INTEGER,
        allowNull: true,
        after: 'district_name',
        defaultValue: null
      }),
      queryInterface.addColumn('users', 'taluka_id', {
        type: Sequelize.INTEGER,
        allowNull: true,
        after: 'taluka_name',
        defaultValue: null
      }),
    ];
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    return [
      queryInterface.removeColumn('users', 'district_id'),
      queryInterface.removeColumn('users', 'taluka_id')
    ];
  }
};