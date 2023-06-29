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
    queryInterface.removeColumn('user_interviews', 'assessment_id');
    queryInterface.removeColumn('user_interviews', 'date_time');
    queryInterface.addColumn('user_interviews', 'interview_slot', { type: 'TIMESTAMP', allowNull: true, defaultValue: null });
    queryInterface.addColumn('user_interviews', 'exam_location', { type: Sequelize.STRING, allowNull: true, defaultValue: null });
    queryInterface.addColumn('user_interviews', 'recommended_level', { type: Sequelize.INTEGER, allowNull: true, defaultValue: null });
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    queryInterface.removeColumn('user_interviews', 'interview_slot');
    queryInterface.removeColumn('user_interviews', 'exam_location');
    queryInterface.removeColumn('user_interviews', 'recommended_level');
    queryInterface.addColumn('user_interviews', 'date_time', { type: 'TIMESTAMP', allowNull: true, defaultValue: null });
    queryInterface.addColumn('user_interviews', 'assessment_id', { type: Sequelize.INTEGER, allowNull: true, defaultValue: null });
  }
};
