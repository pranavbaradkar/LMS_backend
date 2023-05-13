'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('admins', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      first: {
        type: Sequelize.STRING,
        allowNull: false
      },
      last: {
        type: Sequelize.STRING,
        allowNull: false
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false
      },
      role_type: {
        type: Sequelize.ENUM,
        defaultValue: "ADMIN",
        values: ["SUPER_ADMIN", "ADMIN", "CONTENT_ADMIN", "HR_ADMIN"]
      },
      status: {
        type: Sequelize.ENUM,
        defaultValue: "ACTIVE",
        values: ["ACTIVE", "INACTIVE", "PENDING", "BLOCKED"]
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('users');
  }
};