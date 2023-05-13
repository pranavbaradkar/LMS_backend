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
      queryInterface.addColumn('skills','novice_min',{
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue:0,
        after: 'level_id'
      }),
      queryInterface.addColumn('skills', 'novice_max',{
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue:0,
        after: 'novice_min'
      }),
      queryInterface.addColumn('skills', 'advance_begineer_min',{
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue:0,
        after: 'novice_max'
      }),
      queryInterface.addColumn('skills', 'advance_begineer_max',{
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue:0,
        after: 'advance_begineer_min'
      }),
      queryInterface.addColumn('skills', 'competent_min',{
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue:0,
        after: 'advance_begineer_max'
      }),
      queryInterface.addColumn('skills', 'competent_max',{
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue:0,
        after: 'competent_min'
      }),
      queryInterface.addColumn('skills', 'proficient_min',{
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue:0,
        after: 'competent_max'
      }),
      queryInterface.addColumn('skills', 'proficient_max',{
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue:0,
        after: 'proficient_min'
      }),
      queryInterface.addColumn('skills', 'expert_min',{
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue:0,
        after: 'proficient_max'
      }),
      queryInterface.addColumn('skills', 'expert_max',{
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue:0,
        after: 'expert_min'
      })
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
