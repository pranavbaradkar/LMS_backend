// 'use strict';

// module.exports = {
//   async up (queryInterface, Sequelize) {
//     /**
//      * Add altering commands here.
//      *
//      * Example:
//      * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
//      */
//     return [
//         queryInterface.addColumn('user_interview_feedbacks', 'position_applied', { type: Sequelize.STRING, allowNull: true }),
//         queryInterface.addColumn('user_interview_feedbacks', 'position_selected', { type: Sequelize.STRING, allowNull: true }),
//         queryInterface.addColumn('user_interview_feedbacks', 'total_experience', { type: Sequelize.STRING, allowNull: true }),
//         queryInterface.addColumn('user_interview_feedbacks', 'relevant_experience', { type: Sequelize.STRING, allowNull: true }),
//         queryInterface.addColumn('user_interview_feedbacks', 'job_knowledge', { type: Sequelize.TEXT, allowNull: true }),
//         queryInterface.addColumn('user_interview_feedbacks', 'communication_skills', { type: Sequelize.TEXT, allowNull: true }),
//         queryInterface.addColumn('user_interview_feedbacks', 'interpersonal_and_team_skills', { type: Sequelize.TEXT, allowNull: true }),
//         queryInterface.addColumn('user_interview_feedbacks', 'leadership_skills', { type: Sequelize.TEXT, allowNull: true }),
//         queryInterface.addColumn('user_interview_feedbacks', 'hod_designation', { type: Sequelize.STRING, allowNull: true }),
//         queryInterface.addColumn('user_interview_feedbacks', 'personality_and_attitude', { type: Sequelize.TEXT, allowNull: true })
//     ]
//   },

//   async down (queryInterface, Sequelize) {
//     /**
//      * Add reverting commands here.
//      *
//      * Example:
//      * await queryInterface.dropTable('users');
//      */
    
//     return [
      
//       queryInterface.removeColumn('user_interview_feedbacks', 'position_applied'),
//       queryInterface.removeColumn('user_interview_feedbacks', 'position_selected'),
//       queryInterface.removeColumn('user_interview_feedbacks', 'total_experience'),
//       queryInterface.removeColumn('user_interview_feedbacks', 'relevant_experience'),
//       queryInterface.removeColumn('user_interview_feedbacks', 'job_knowledge'),
//       queryInterface.removeColumn('user_interview_feedbacks', 'communication_skills'),
//       queryInterface.removeColumn('user_interview_feedbacks', 'interpersonal_and_team_skills'),
//       queryInterface.removeColumn('user_interview_feedbacks', 'leadership_skills'),
//       queryInterface.removeColumn('user_interview_feedbacks', 'hod_designation'),
//       queryInterface.removeColumn('user_interview_feedbacks', 'personality_and_attitude'),
//     ];
    
//   }
// };

