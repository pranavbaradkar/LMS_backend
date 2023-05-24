'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('question_pools', {
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
      assessment_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      assessment_type: {
        type: Sequelize.ENUM('SCREENING', 'MAINS'),
        allowNull: false
      },
      question: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      question_status: {
        type: Sequelize.ENUM('COMPLETED', 'PENDING'),
        allowNull: false,
        defaultValue: "PENDING"
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
    return queryInterface.dropTable('question_pools');
  }
};