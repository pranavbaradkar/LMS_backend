'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    return [
      queryInterface.addColumn("users", "invited_at", {
        type: Sequelize.DATE,
        allowNull: true
      }),
      queryInterface.addColumn("users", "invite_code", {
        type: Sequelize.STRING,
        allowNull: true
      })
    ];
  },

  async down (queryInterface, Sequelize) {
    return [
      queryInterface.removeColumn('users', 'invited_at'),
      queryInterface.removeColumn('users', 'invite_code')
    ]
  }
};
