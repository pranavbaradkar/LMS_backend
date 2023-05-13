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
      queryInterface.addColumn("assessment_questions", "type", {
        type: Sequelize.ENUM('SCREENING', 'MAINS'),
        allowNull: true,
        defaultValue : 'SCREENING',
        after:'question_id'
      }),
      queryInterface.addColumn("assessment_questions", "score", {
        type: Sequelize.FLOAT,
        defaultValue : 0,
        after:'type'
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
