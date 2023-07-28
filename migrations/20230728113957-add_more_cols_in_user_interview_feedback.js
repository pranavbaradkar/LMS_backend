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
      queryInterface.addColumn('user_interview_feedbacks', 'analytical_skills', { type: Sequelize.TEXT, allowNull: true }),
      queryInterface.addColumn('user_interview_feedbacks', 'hod_name', { type: Sequelize.STRING, allowNull: true }),
      queryInterface.addColumn('user_interview_feedbacks', 'notice_period', { type: Sequelize.STRING, allowNull: true })
    ]
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    
    return [
      queryInterface.removeColumn('user_interview_feedbacks', 'analytical_skills'),
      queryInterface.removeColumn('user_interview_feedbacks', 'hod_name'),
      queryInterface.removeColumn('user_interview_feedbacks', 'notice_period')
    ] 
    
  }
};
