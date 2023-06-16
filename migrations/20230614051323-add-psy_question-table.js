'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('psy_questions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT,
      },
      set_number : {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      score_type : {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      skill_id : { 
        type: Sequelize.INTEGER, 
        allowNull: true 
      },
      level_id : { 
        type: Sequelize.INTEGER, 
        allowNull: true 
      },
      grade_id : { 
        type: Sequelize.INTEGER, 
        allowNull: true 
      },
      subject_id : { 
        type: Sequelize.INTEGER, 
        allowNull: true 
      },
      strand_id : { 
        type: Sequelize.INTEGER, 
        allowNull: true 
      },
      sub_strand_id : { 
        type: Sequelize.INTEGER, 
        allowNull: true 
      },
      topic_id : { 
        type: Sequelize.INTEGER, 
        allowNull: true 
      },
      question_type : { 
        type: Sequelize.ENUM('SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'FILL_IN_THE_BLANKS', 'TRUE_FALSE', 'MATCH_THE_FOLLOWING'), 
        allowNull: true
      },
      statement : { 
        type: Sequelize.TEXT, 
        allowNull: false 
      },
      hint : { 
        type: Sequelize.TEXT, 
        allowNull: true 
      },
      knowledge_level : { 
        type: Sequelize.ENUM('MUST_KNOW', 'SHOULD_KNOW', 'NICE_TO_KNOW'), 
        allowNull: true, 
        defaultValue: null 
      },
      proficiency_level : { 
        type: Sequelize.ENUM('A1', 'A2', 'B1', 'B2', 'C1', 'C2'), 
        allowNull: true, 
        defaultValue: null
      },
      s3url : { 
        type: Sequelize.TEXT, 
        allowNull: true 
      },
      mime_type : { 
        type: Sequelize.STRING, 
        allowNull: true, 
        defaultValue: null 
      },
      correct_answer : { 
        type: Sequelize.STRING, 
        allowNull: true 
      },
      answer_explanation : { 
        type: Sequelize.TEXT, 
        allowNull: true 
      },
      blooms_taxonomy : { 
        type: Sequelize.ENUM('REMEMBER', 'UNDERSTAND', 'APPLY', 'ANALYZE', 'EVALUTE', 'CREATE'), 
        allowNull: true 
      },
      difficulty_level : { 
        type: Sequelize.ENUM('EASY', 'MEDIUM', 'HARD', 'VERY_HARD'), 
        allowNull: true 
      },
      complexity_level : { 
        type: Sequelize.ENUM('P1', 'P2', 'P3', 'P4', 'P5'), 
        allowNull: true, 
      },
      estimated_time : { 
        type: Sequelize.INTEGER(11), 
        allowNull: true, 
        defaultValue: 0 
      },
      correct_answer_score : { 
        type: Sequelize.FLOAT(5, 2), 
        allowNull: true, 
        defaultValue: 0 
      },
      answer : { 
        type: Sequelize.STRING, 
        allowNull: true 
      },
      tags : { 
        type: Sequelize.TEXT, 
        allowNull: true 
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
    return queryInterface.dropTable('psy_questions');
  }
};