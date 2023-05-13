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
      queryInterface.changeColumn('skills','description',{
        type: Sequelize.TEXT, 
        allowNull: true, 
        defaultValue: null
      }),
      queryInterface.changeColumn('skills','grade_id',{
        type: Sequelize.INTEGER(11), 
        allowNull: true, 
        defaultValue: 0
      }),
      queryInterface.changeColumn('skills','level_id',{
        type: Sequelize.INTEGER(11), 
        allowNull: true, 
        defaultValue: 0
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
