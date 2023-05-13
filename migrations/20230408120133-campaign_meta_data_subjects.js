'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
   
    return Promise.all([
      await queryInterface.changeColumn('campaigns', 'subject_ids', {
        type: 'jsonb USING CAST("subject_ids" as jsonb)',
        allowNull: true,
        defaultValue: null
      })
    ])
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
