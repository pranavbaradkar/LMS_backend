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
      queryInterface.changeColumn('academics','education_certificate', {
        type: Sequelize.TEXT,
        allowNull: false,
      }),
      queryInterface.changeColumn('academics','start_date', {
        type: Sequelize.DATE,
        allowNull: false,
      }),
      queryInterface.changeColumn('academics','end_date', {
        type: Sequelize.DATE,
        allowNull: false,
      }),
      queryInterface.changeColumn('academics','field_of_study', {
        type: Sequelize.TEXT,
        allowNull: false
      }),
      queryInterface.changeColumn('academics','extra_carricular_activities', {
        type: Sequelize.TEXT,
        allowNull: true,
        defaultValue: null
      }),
      queryInterface.changeColumn('academics','achievement', {
        type: Sequelize.TEXT,
        allowNull: true,
        defaultValue: null
      }),
      queryInterface.changeColumn('academics','certificates', {
        type: Sequelize.TEXT,
        allowNull: true,
        defaultValue: null
      }),
      queryInterface.addColumn('academics','grade_score', {
        type: Sequelize.FLOAT,
        allowNull: true,
        defaultValue: null
      }),
      queryInterface.addColumn('academics','grade_type', {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null
      }),
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
