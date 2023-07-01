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
      queryInterface.removeColumn('user_interviews', 'interview_slot'),
      queryInterface.removeColumn('user_interviews', 'interviewer'),
      queryInterface.addColumn('user_interviews', 'interviewer_id', { type: Sequelize.INTEGER, allowNull: true, defaultValue: null }),
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
      queryInterface.addColumn('user_interviews', 'interview_slot', { type: 'TIMESTAMP', allowNull: true, defaultValue: null }),
      queryInterface.removeColumn('user_interviews', 'interviewer_id'),
      queryInterface.addColumn('user_interviews', 'interviewer', { type: Sequelize.STRING, allowNull: true, defaultValue: null }),
    ];
  }
};
