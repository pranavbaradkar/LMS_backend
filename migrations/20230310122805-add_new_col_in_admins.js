'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    return [
      queryInterface.addColumn("admins", "title", {
        type: Sequelize.ENUM("Ms", "Mrs", "Mr"),
        defaultValue: "Mr",
        allowNull: false
      }),
      queryInterface.addColumn("admins", "role_type", {
        type: Sequelize.ENUM("SUPER_ADMIN", "USER"),
        defaultValue: "USER",
        allowNull: false
      }),
      queryInterface.addColumn('admins', 'middle', {
        type: Sequelize.STRING,
        allowNull: true,
        after: 'first'
      }),
      queryInterface.addColumn('admins', 'role_id', {
        type: Sequelize.INTEGER,
        allowNull: true
      }),
    ];
  },

  async down (queryInterface, Sequelize) {
    return [
      queryInterface.removeColumn('admins', 'title'),
      queryInterface.removeColumn('admins', 'role_type'),
      queryInterface.removeColumn('admins', 'middle'),
      queryInterface.removeColumn('admins', 'role_id')
    ]
  }
};
