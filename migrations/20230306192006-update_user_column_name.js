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
      queryInterface.renameColumn('users', 'first', 'first_name'),
      queryInterface.renameColumn('users', 'middle', 'middle_name'),
      queryInterface.renameColumn('users', 'last', 'last_name'),
      queryInterface.renameColumn('users', 'addresss', 'address'),
      queryInterface.renameColumn('users', 'phone', 'phone_no')
    ]
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    return [
      queryInterface.renameColumn('users', 'first_name', 'first'),
      queryInterface.renameColumn('users', 'middle_name', 'middle'),
      queryInterface.renameColumn('users', 'last_name', 'last'),
      queryInterface.renameColumn('users', 'address', 'addresss'),
      queryInterface.renameColumn('users', 'phone_no', 'phone')
    ]
  }
};
