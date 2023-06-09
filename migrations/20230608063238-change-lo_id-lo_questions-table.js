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
      await queryInterface.renameColumn("lo_questions", "lo_id", "lo_ids", {
        transaction
      });
      await queryInterface.changeColumn('lo_questions', 'lo_ids', { type: Sequelize.TEXT, allowNull: true, defaultValue: null }, {
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
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.renameColumn("lo_questions", "lo_ids", "lo_id", {
        transaction
      });
      await queryInterface.changeColumn('lo_questions', 'lo_id', { type: Sequelize.INTEGER, allowNull: true, defaultValue: null }, {
        transaction
      });
    });
  }
};
