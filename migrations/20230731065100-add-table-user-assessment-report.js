'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('user_assessment_reports', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id : { 
        type: Sequelize.INTEGER, 
        allowNull: false
      },
      assessment_id : { 
        type: Sequelize.INTEGER, 
        allowNull: false
      },
      assessment_type : { 
        type: Sequelize.STRING, 
        allowNull: false
      },
      result : { 
        type: Sequelize.STRING, 
        allowNull: false
      },
      percentile:{
        type: Sequelize.DECIMAL,
        allowNull: false
      },
      skill_score : { 
        type: Sequelize.INTEGER, 
        allowNull: false
      },
      subject_score : { 
        type: Sequelize.INTEGER, 
        allowNull: false
      },
      skill_total : { 
        type: Sequelize.INTEGER, 
        allowNull: false
      },
      total : { 
        type: Sequelize.INTEGER, 
        allowNull: false
      },
      total_scored : { 
        type: Sequelize.INTEGER, 
        allowNull: false
      },
      question_id : { 
        type: Sequelize.INTEGER, 
        allowNull: false
      },
      is_correct : { 
        type: Sequelize.BOOLEAN, 
        allowNull: false
      },
      score : { 
        type: Sequelize.INTEGER, 
        allowNull: false
      },
      skill_id : { 
        type: Sequelize.INTEGER, 
        allowNull: false
      },
      skill_name : { 
        type: Sequelize.STRING, 
        allowNull: true
      },
      level_id : { 
        type: Sequelize.INTEGER, 
        allowNull: false
      },
      level_name : { 
        type: Sequelize.STRING, 
        allowNull: true
      },
      grade_id : { 
        type: Sequelize.INTEGER, 
        allowNull: false
      },
      grade_name : { 
        type: Sequelize.STRING, 
        allowNull: true
      },
      difficulty_level : { 
        type: Sequelize.STRING, 
        allowNull: true
      },
      blooms_taxonomy : { 
        type: Sequelize.STRING, 
        allowNull: true
      },
      complexity_level : { 
        type: Sequelize.STRING, 
        allowNull: true
      },
      lo_ids               : { type: Sequelize.TEXT, allowNull: true },
      subject_id           : { type: Sequelize.INTEGER, allowNull: true },
      strand_id            : { type: Sequelize.INTEGER, allowNull: true },
      sub_strand_id        : { type: Sequelize.INTEGER, allowNull: true },
      topic_id             : { type: Sequelize.INTEGER, allowNull: true },
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
    return queryInterface.dropTable('user_assessment_reports');
  }
};