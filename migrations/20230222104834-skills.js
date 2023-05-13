'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {

    return queryInterface.createTable('skills', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
      },
      name: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      is_include_subject: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      grade_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      level_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });
  },

  async down(queryInterface, Sequelize) {

    return queryInterface.dropTable('skills');
  }
};
