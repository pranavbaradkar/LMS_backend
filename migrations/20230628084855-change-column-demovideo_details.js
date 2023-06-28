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
      await queryInterface.removeColumn("demovideo_details", "scores", { transaction });
      await queryInterface.removeColumn("demovideo_details", "total_score", { transaction });
      await queryInterface.addColumn('demovideo_details', 'scores', { type: Sequelize.JSONB, allowNull: true, defaultValue: null }, { transaction });
      await queryInterface.addColumn('demovideo_details', 'total_score', { type: Sequelize.DECIMAL(10,2), allowNull: true, defaultValue: null }, { transaction });
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
