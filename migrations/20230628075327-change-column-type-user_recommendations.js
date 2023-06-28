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
    queryInterface.changeColumn('user_recommendations', 'demo_score', { type: Sequelize.DECIMAL(10,2), allowNull: true, defaultValue: null });
    queryInterface.changeColumn('user_recommendations', 'demo_score_total', { type: Sequelize.DECIMAL(10,2), allowNull: true, defaultValue: null });
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    queryInterface.changeColumn('user_recommendations', 'demo_score', { type: Sequelize.INTEGER, allowNull: true, defaultValue: null });
    queryInterface.changeColumn('user_recommendations', 'demo_score_total', { type: Sequelize.INTEGER, allowNull: true, defaultValue: null });
  }
};
