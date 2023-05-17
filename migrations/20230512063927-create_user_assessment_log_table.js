'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('user_assessment_logs', {
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
      assessment_type: {
        type: Sequelize.ENUM('SCREENING', 'MAINS'),
        allowNull: false
      },
      assessment_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      question_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      question_status: {
        type: Sequelize.ENUM('PROGRESS', 'COMPLETED', 'SKIPPED', 'PENDING'),
        allowNull: false,
        defaultValue: "PENDING"
      },
      elapsed_time: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      deleted_at: {
        allowNull: true,
        defaultValue: null,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('user_assessment_logs');
  }
};