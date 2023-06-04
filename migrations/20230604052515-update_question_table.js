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
      queryInterface.changeColumn('questions', 'estimated_time', { type: Sequelize.INTEGER(11), allowNull: true, defaultValue: 0}),
      queryInterface.changeColumn('questions', 'correct_answer_score', { type: Sequelize.FLOAT(5, 2), allowNull: true, defaultValue: 0})
    ];
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
