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
    return  queryInterface.addColumn('user_assessment_slots', 'demo_video_status', {
        type: Sequelize.ENUM('PENDING', 'SUBMITTED', 'AI_STATUS_COMPLETED', 'MANUAL_STATUS_COMPLETED', 'PASSED', 'FAILED'),
        allowNull: true,
        defaultValue: 'PENDING'
      })
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    return queryInterface.removeColumn('user_assessment_slots', 'demo_video_status');
  }
};

 