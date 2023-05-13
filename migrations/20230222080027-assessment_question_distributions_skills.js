'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('assessment_question_distributions_skills', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      assessment_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      skill_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      total_no_questions: {
        type: Sequelize.INTEGER,
        allowNull: false,
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
    return queryInterface.dropTable('assessment_question_distributions_skills');
  }
};