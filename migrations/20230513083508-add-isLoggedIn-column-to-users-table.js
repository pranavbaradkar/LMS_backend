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

      await queryInterface.addColumn("users", "is_logged_in", {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        after: 'id'
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
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn("users", "is_logged_in");
    });
  }
};
