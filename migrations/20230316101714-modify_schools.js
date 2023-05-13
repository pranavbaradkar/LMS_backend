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
      queryInterface.addColumn('schools', 'pincode',{
        type: Sequelize.INTEGER,
        allowNull: true,
        after: 'address'
      }),
      queryInterface.addColumn('schools', 'email',{
        type: Sequelize.STRING,
        allowNull: true,
        after: 'school_code'
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
