'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return [
      queryInterface.addColumn('campaigns', 'name', {
        type: Sequelize.STRING,
        allowNull: true,
        after: 'id'
      }),
      queryInterface.addColumn('campaigns', 'start_time', {
        type: Sequelize.DATE,
        allowNull: true,
        after: 'end_date',
        defaultValue: null
      }),
      queryInterface.addColumn('campaigns', 'end_time', {
        type: Sequelize.DATE,
        allowNull: true,
        after: 'start_time',
        defaultValue: null
      }),
      queryInterface.addColumn('campaigns', 'cluster_ids', {
        type: Sequelize.STRING,
        allowNull: true,
        after: 'level_id',
        defaultValue: null
      }),
      queryInterface.addColumn('campaigns', 'schools_ids', {
        type: Sequelize.STRING,
        allowNull: true,
        after: 'cluster_ids',
        defaultValue: null
      }),
      queryInterface.addColumn('campaigns', 'subject_ids', {
        type: Sequelize.STRING,
        allowNull: true,
        after: 'schools_ids',
        defaultValue: null
      }),
      queryInterface.addColumn('campaigns', 'skill_ids', {
        type: Sequelize.STRING,
        allowNull: true,
        after: 'subject_ids',
        defaultValue: null
      }),
      queryInterface.renameColumn('campaigns', 'level_id', 'level_ids')
    ]
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    return queryInterface.changeColumn('campaigns', 'level_id');
  }
};
