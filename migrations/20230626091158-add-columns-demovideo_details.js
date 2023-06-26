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
    return  [
      queryInterface.addColumn('demovideo_details', 'subject_id', { type: Sequelize.INTEGER, allowNull: true }),
      queryInterface.addColumn('demovideo_details', 'grade_id', { type: Sequelize.INTEGER, allowNull: true }),
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
      queryInterface.removeColumn('demovideo_details', 'subject_id'),
      queryInterface.removeColumn('demovideo_details', 'grade_id')
    ]
  }
};