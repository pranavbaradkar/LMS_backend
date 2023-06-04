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
    return  queryInterface.addColumn('lo_questions', 'skill_id', {
        type: Sequelize.INTEGER,
        allowNull: true,
        after: 'subject_id',
        defaultValue: null
      })
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    return queryInterface.removeColumn('lo_questions', 'skill_id');
  }
};