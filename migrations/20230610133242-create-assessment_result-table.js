'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    
     return queryInterface.createTable('assessment_results', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
      },
      user_id:{
        type: Sequelize.INTEGER,
        allowNull: false
      },
      assessment_id:{
        type: Sequelize.INTEGER,
        allowNull: false
      },
      skill_scores:{
        type: Sequelize.STRING,
        allowNull: false
      },
      percentile:{
        type: Sequelize.DECIMAL,
        allowNull: false
      },
      type:{
        type: Sequelize.ENUM('SCREENING', 'MAINS'),
        allowNull: false
      },
      result:{
        type: Sequelize.ENUM('PASSED', 'FAILED'),
        allowNull: false
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true
      }
    });
  },

  async down (queryInterface, Sequelize) {
     return queryInterface.dropTable('assessment_results');
  }
};
