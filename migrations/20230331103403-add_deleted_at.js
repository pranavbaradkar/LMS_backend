'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */

    

    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn("admins", "deleted_at", {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null
      });
     
      await queryInterface.addColumn("assessment_configurations", "deleted_at", {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null
      });
   
      await queryInterface.addColumn("assessment_question_distributions_skills", "deleted_at", {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null
      });
    
      await queryInterface.addColumn("assessment_questions", "deleted_at", {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null
      });
      
      await queryInterface.addColumn("assessments", "deleted_at", {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null
      });
     
      await queryInterface.addColumn("associate_campaigns", "deleted_at", {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null
      });
     
      await queryInterface.addColumn("boards", "deleted_at", {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null
      });
      
      await queryInterface.addColumn("brands", "deleted_at", {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null
      });
      
      await queryInterface.addColumn("campaigns", "deleted_at", {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null
      });
     
      await queryInterface.addColumn("cities", "deleted_at", {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null
      });
     
      await queryInterface.addColumn("clusters_meta", "deleted_at", {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null
      });
      
      
      await queryInterface.addColumn("countries", "deleted_at", {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null
      });
      
      await queryInterface.addColumn("districts", "deleted_at", {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null
      });
      
      await queryInterface.addColumn("employee_types", "deleted_at", {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null
      });
      
      await queryInterface.addColumn("grades", "deleted_at", {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null
      });
      
      await queryInterface.addColumn("grade_subjects", "deleted_at", {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null
      });
      
      await queryInterface.addColumn("institutes", "deleted_at", {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null
      });
      
      await queryInterface.addColumn("learning_objectives", "deleted_at", {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null
      });
    
      await queryInterface.addColumn("levels", "deleted_at", {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null
      });
      
      await queryInterface.addColumn("level_grades", "deleted_at", {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null
      });
     
      await queryInterface.addColumn("lo_skills", "deleted_at", {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null
      });
     
      await queryInterface.addColumn("lo_subjects", "deleted_at", {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null
      });
      
      await queryInterface.addColumn("professional_infos", "deleted_at", {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null
      });
      
      await queryInterface.addColumn("question_los", "deleted_at", {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null
      });
      
      await queryInterface.addColumn("question_options", "deleted_at", {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null
      });
     
      await queryInterface.addColumn("questions", "deleted_at", {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null
      });
     
      await queryInterface.addColumn("roles", "deleted_at", {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null
      });
     
      await queryInterface.addColumn("school_boards", "deleted_at", {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null
      });
      
      await queryInterface.addColumn("school_grades", "deleted_at", {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null
      });
      
      await queryInterface.addColumn("school_levels", "deleted_at", {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null
      });
      
      await queryInterface.addColumn("school_subjects", "deleted_at", {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null
      });
      
      await queryInterface.addColumn("schools", "deleted_at", {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null
      });

      await queryInterface.addColumn("skills", "deleted_at", {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null
      });

      await queryInterface.addColumn("states", "deleted_at", {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null
      });

      await queryInterface.addColumn("subject_categories", "deleted_at", {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null
      });

      await queryInterface.addColumn("subject_skills", "deleted_at", {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null
      });

      await queryInterface.addColumn("subjects", "deleted_at", {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null
      });

      await queryInterface.addColumn("talukas", "deleted_at", {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null
      });

      await queryInterface.addColumn("user_assessment_responses", "deleted_at", {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null
      });

      await queryInterface.addColumn("user_assessments", "deleted_at", {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null
      });
    
      await queryInterface.addColumn("users", "deleted_at", {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null
      });
   
      await queryInterface.addColumn("question_subjects", "deleted_at", {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null
      });

      await queryInterface.addColumn("academics", "deleted_at", {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null
      });

      await queryInterface.addColumn("user_communications", "deleted_at", {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null
      });

    });
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};
