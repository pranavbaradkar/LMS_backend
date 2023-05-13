'use strict';


module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.changeColumn('campaigns', 'level_ids', {
        type: 'JSONB USING CAST("level_ids" as JSONB)',
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
