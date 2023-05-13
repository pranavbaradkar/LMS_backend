'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('professional_infos', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      experience_year: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      experience_month: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      position: {
        type: Sequelize.STRING,
        allowNull: false
      },
      employee_type_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      institute_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      board_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      level_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      subject_id: {
        type: Sequelize.INTEGER,
        allowNull: false
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
    return queryInterface.dropTable('professional_infos');
  }
};