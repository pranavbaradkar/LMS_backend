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
      queryInterface.addColumn('user_recommendations', 'recommendation_status', { type: Sequelize.ENUM('PENDING', 'AGREE', 'DISAGREE'), allowNull: true, defaultValue: null })
    ]
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    
    return queryInterface.removeColumn('user_recommendations', 'recommendation_status');    
    
  }
};
