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
      queryInterface.renameColumn('academics','university', 'institution'),
      queryInterface.renameColumn('academics','education_certificate', 'programme'),
      queryInterface.renameColumn('academics','achievement', 'achievements'),
      queryInterface.renameColumn('academics','certificates', 'certificate_url')
      
    ]
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    return [
      queryInterface.renameColumn('academics','institution', 'university'),
      queryInterface.renameColumn('academics','programme', 'education_certificate'),
      queryInterface.renameColumn('academics','achievements', 'achievement')
    ]
  }
};
