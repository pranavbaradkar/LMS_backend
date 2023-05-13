'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return [
      queryInterface.addColumn('users', 'is_profile_created', {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        after: 'invite_code'
      }),
    ]
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    return queryInterface.changeColumn('campaigns', 'level_id');
  }
};
