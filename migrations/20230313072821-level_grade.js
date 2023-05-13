'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {

    return queryInterface.createTable('level_grades', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
      },
      level_id: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      grade_id: {
        type: Sequelize.INTEGER,
        allowNull: true
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

    return queryInterface.dropTable('level_grade');
  }
};
