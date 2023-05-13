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
      await queryInterface.renameColumn("admins", "createdAt", "created_at", {
        transaction
      });
      await queryInterface.renameColumn("admins", "updatedAt", "updated_at", {
        transaction
      });
      await queryInterface.renameColumn("assessment_configurations", "createdAt", "created_at", {
        transaction
      });
      await queryInterface.renameColumn("assessment_configurations", "updatedAt", "updated_at", {
        transaction
      });
      await queryInterface.renameColumn("assessment_question_distributions_skills", "createdAt", "created_at", {
        transaction
      });
      await queryInterface.renameColumn("assessment_question_distributions_skills", "updatedAt", "updated_at", {
        transaction
      });
      await queryInterface.renameColumn("assessment_questions", "createdAt", "created_at", {
        transaction
      });
      await queryInterface.renameColumn("assessment_questions", "updatedAt", "updated_at", {
        transaction
      });
      await queryInterface.renameColumn("assessments", "createdAt", "created_at", {
        transaction
      });
      await queryInterface.renameColumn("assessments", "updatedAt", "updated_at", {
        transaction
      });
      await queryInterface.renameColumn("associate_campaigns", "createdAt", "created_at", {
        transaction
      });
      await queryInterface.renameColumn("associate_campaigns", "updatedAt", "updated_at", {
        transaction
      });
      await queryInterface.renameColumn("boards", "createdAt", "created_at", {
        transaction
      });
      await queryInterface.renameColumn("boards", "updatedAt", "updated_at", {
        transaction
      });
      await queryInterface.renameColumn("brands", "createdAt", "created_at", {
        transaction
      });
      await queryInterface.renameColumn("brands", "updatedAt", "updated_at", {
        transaction
      });
      await queryInterface.renameColumn("campaigns", "createdAt", "created_at", {
        transaction
      });
      await queryInterface.renameColumn("campaigns", "updatedAt", "updated_at", {
        transaction
      });
      await queryInterface.renameColumn("cities", "createdAt", "created_at", {
        transaction
      });
      await queryInterface.renameColumn("cities", "updatedAt", "updated_at", {
        transaction
      });
      await queryInterface.renameColumn("clusters_meta", "createdAt", "created_at", {
        transaction
      });
      await queryInterface.renameColumn("clusters_meta", "updatedAt", "updated_at", {
        transaction
      });
      await queryInterface.renameColumn("clusters", "createdAt", "created_at", {
        transaction
      });
      await queryInterface.renameColumn("clusters", "updatedAt", "updated_at", {
        transaction
      });
      await queryInterface.renameColumn("countries", "createdAt", "created_at", {
        transaction
      });
      await queryInterface.renameColumn("countries", "updatedAt", "updated_at", {
        transaction
      });
      await queryInterface.renameColumn("districts", "createdAt", "created_at", {
        transaction
      });
      await queryInterface.renameColumn("districts", "updatedAt", "updated_at", {
        transaction
      });
      await queryInterface.renameColumn("employee_types", "createdAt", "created_at", {
        transaction
      });
      await queryInterface.renameColumn("employee_types", "updatedAt", "updated_at", {
        transaction
      });
      await queryInterface.renameColumn("grades", "createdAt", "created_at", {
        transaction
      });
      await queryInterface.renameColumn("grades", "updatedAt", "updated_at", {
        transaction
      });
      await queryInterface.renameColumn("grade_subjects", "createdAt", "created_at", {
        transaction
      });
      await queryInterface.renameColumn("grade_subjects", "updatedAt", "updated_at", {
        transaction
      });
      await queryInterface.renameColumn("institutes", "createdAt", "created_at", {
        transaction
      });
      await queryInterface.renameColumn("institutes", "updatedAt", "updated_at", {
        transaction
      });
      await queryInterface.renameColumn("learning_objectives", "createdAt", "created_at", {
        transaction
      });
      await queryInterface.renameColumn("learning_objectives", "updatedAt", "updated_at", {
        transaction
      });
      await queryInterface.renameColumn("levels", "createdAt", "created_at", {
        transaction
      });
      await queryInterface.renameColumn("levels", "updatedAt", "updated_at", {
        transaction
      });
      await queryInterface.renameColumn("level_grades", "createdAt", "created_at", {
        transaction
      });
      await queryInterface.renameColumn("level_grades", "updatedAt", "updated_at", {
        transaction
      });
      await queryInterface.renameColumn("lo_skills", "createdAt", "created_at", {
        transaction
      });
      await queryInterface.renameColumn("lo_skills", "updatedAt", "updated_at", {
        transaction
      });
      await queryInterface.renameColumn("lo_subjects", "createdAt", "created_at", {
        transaction
      });
      await queryInterface.renameColumn("lo_subjects", "updatedAt", "updated_at", {
        transaction
      });
      await queryInterface.renameColumn("professional_infos", "createdAt", "created_at", {
        transaction
      });
      await queryInterface.renameColumn("professional_infos", "updatedAt", "updated_at", {
        transaction
      });
      await queryInterface.renameColumn("question_los", "createdAt", "created_at", {
        transaction
      });
      await queryInterface.renameColumn("question_los", "updatedAt", "updated_at", {
        transaction
      });
      await queryInterface.renameColumn("question_options", "createdAt", "created_at", {
        transaction
      });
      await queryInterface.renameColumn("question_options", "updatedAt", "updated_at", {
        transaction
      });
      await queryInterface.renameColumn("questions", "createdAt", "created_at", {
        transaction
      });
      await queryInterface.renameColumn("questions", "updatedAt", "updated_at", {
        transaction
      });
      await queryInterface.renameColumn("roles", "createdAt", "created_at", {
        transaction
      });
      await queryInterface.renameColumn("roles", "updatedAt", "updated_at", {
        transaction
      });
      await queryInterface.renameColumn("school_boards", "createdAt", "created_at", {
        transaction
      });
      await queryInterface.renameColumn("school_boards", "updatedAt", "updated_at", {
        transaction
      });
      await queryInterface.renameColumn("school_grades", "createdAt", "created_at", {
        transaction
      });
      await queryInterface.renameColumn("school_grades", "updatedAt", "updated_at", {
        transaction
      });
      await queryInterface.renameColumn("school_levels", "createdAt", "created_at", {
        transaction
      });
      await queryInterface.renameColumn("school_levels", "updatedAt", "updated_at", {
        transaction
      });
      await queryInterface.renameColumn("school_subjects", "createdAt", "created_at", {
        transaction
      });
      await queryInterface.renameColumn("school_subjects", "updatedAt", "updated_at", {
        transaction
      });
      await queryInterface.renameColumn("schools", "createdAt", "created_at", {
        transaction
      });
      await queryInterface.renameColumn("schools", "updatedAt", "updated_at", {
        transaction
      });
      await queryInterface.renameColumn("skills", "createdAt", "created_at", {
        transaction
      });
      await queryInterface.renameColumn("skills", "updatedAt", "updated_at", {
        transaction
      });
      await queryInterface.renameColumn("states", "createdAt", "created_at", {
        transaction
      });
      await queryInterface.renameColumn("states", "updatedAt", "updated_at", {
        transaction
      });
      await queryInterface.renameColumn("subject_categories", "createdAt", "created_at", {
        transaction
      });
      await queryInterface.renameColumn("subject_categories", "updatedAt", "updated_at", {
        transaction
      });
      await queryInterface.renameColumn("subject_skills", "createdAt", "created_at", {
        transaction
      });
      await queryInterface.renameColumn("subject_skills", "updatedAt", "updated_at", {
        transaction
      });
      await queryInterface.renameColumn("subjects", "createdAt", "created_at", {
        transaction
      });
      await queryInterface.renameColumn("subjects", "updatedAt", "updated_at", {
        transaction
      });
      await queryInterface.renameColumn("talukas", "createdAt", "created_at", {
        transaction
      });
      await queryInterface.renameColumn("talukas", "updatedAt", "updated_at", {
        transaction
      });
      await queryInterface.renameColumn("user_assessment_response", "createdAt", "created_at", {
        transaction
      });
      await queryInterface.renameColumn("user_assessment_response", "updatedAt", "updated_at", {
        transaction
      });
      await queryInterface.renameColumn("user_assessments", "createdAt", "created_at", {
        transaction
      });
      await queryInterface.renameColumn("user_assessments", "updatedAt", "updated_at", {
        transaction
      });
      await queryInterface.renameColumn("users", "createdAt", "created_at", {
        transaction
      });
      await queryInterface.renameColumn("users", "updatedAt", "updated_at", {
        transaction
      });
      await queryInterface.renameColumn("question_subjects", "createdAt", "created_at", {
        transaction
      });
      await queryInterface.renameColumn("question_subjects", "updatedAt", "updated_at", {
        transaction
      });
      await queryInterface.renameColumn("clusters", "deletedAt", "deleted_at", {
        transaction
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
