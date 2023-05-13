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
    return [
      // queryInterface.changeColumn('professional_infos','end_date', {
      //   allowNull: true,
      //   type: Sequelize.DATE
      // }),
      // queryInterface.changeColumn('professional_infos','start_date', {
      //   allowNull: false,
      //   type: Sequelize.DATE
      // }),
      // queryInterface.addColumn('professional_infos','grade_ids', {
      //   type: Sequelize.STRING,
      //   allowNull: true,
      // }),
      queryInterface.renameColumn('professional_infos','subject_id', 'subject_ids'),
      queryInterface.renameColumn('professional_infos','level_id', 'level_ids'),
      queryInterface.removeColumn('professional_infos','institute_id')
    ]
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
