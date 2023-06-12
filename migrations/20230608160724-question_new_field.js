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
      queryInterface.addColumn('questions', 'strand_id', { type: Sequelize.INTEGER, allowNull: true, }),
      queryInterface.addColumn('questions', 'sub_strand_id', { type: Sequelize.INTEGER, allowNull: true, }),
      queryInterface.addColumn('questions', 'topic_id', { type: Sequelize.INTEGER, allowNull: true, }),
      queryInterface.addColumn('questions', 'grade_id', { type: Sequelize.INTEGER, allowNull: true, }),
      queryInterface.addColumn('questions', 'lo_ids', { type: Sequelize.TEXT, allowNull: true, }),
      
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
