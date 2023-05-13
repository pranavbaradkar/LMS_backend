'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {

    return queryInterface.createTable('grade_subjects', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
      },
      grade_id: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      subject_id: {
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

    return queryInterface.dropTable('grade_subject');
  }
};
