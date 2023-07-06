'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    return [
      queryInterface.addColumn('assessments', 'status', { type: Sequelize.ENUM('DRAFT', 'PUBLISHED', 'PENDING'), allowNull: true, defaultValue: 'PENDING' })
    ]
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    
    return queryInterface.removeColumn('assessments', 'status');    
    
  }
};
