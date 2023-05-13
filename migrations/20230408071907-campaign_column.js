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

      await queryInterface.changeColumn('campaigns', 'cluster_ids', {
        type: Sequelize.TEXT,
        allowNull: true,
        defaultValue: null
      });
      await queryInterface.renameColumn('campaigns', 'schools_ids', 'school_ids');
      await queryInterface.changeColumn('campaigns', 'school_ids', {
        type: Sequelize.TEXT,
        allowNull: true,
        defaultValue: null
      });
      await  queryInterface.changeColumn('campaigns', 'subject_ids', {
        type: Sequelize.TEXT,
        allowNull: true,
        defaultValue: null
      });
      await queryInterface.changeColumn('campaigns', 'skill_ids', {
        type: Sequelize.TEXT,
        allowNull: true,
        defaultValue: null
      });
      await queryInterface.changeColumn('campaigns', 'level_ids', {
        type: Sequelize.TEXT,
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
