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
      queryInterface.addColumn('user_assessment_slots', 'padv_video_link', {
        type: Sequelize.STRING,
        allowNull: true,
        after: 'video_link',
        defaultValue: null
      }),
      queryInterface.addColumn('user_assessment_slots', 'demo_link', {
        type: Sequelize.STRING,
        allowNull: true,
        after: 'video_link',
        defaultValue: null
      }),
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
      queryInterface.removeColumn('user_assessment_slots', 'padv_video_link'),
      queryInterface.removeColumn('user_assessment_slots', 'demo_link')
    ];
  }
};