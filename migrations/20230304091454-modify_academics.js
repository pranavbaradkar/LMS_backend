'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {

    return [
      queryInterface.addColumn('academics', 'field_of_study', {
        type: Sequelize.TEXT,
        allowNull: false,
        defaultValue: false
      }),
      queryInterface.addColumn('academics', 'achievement', {
        type: Sequelize.TEXT,
        allowNull: false,
        defaultValue: false
      }),
      queryInterface.addColumn('academics', 'certificates', {
        type: Sequelize.TEXT,
        allowNull: false,
        defaultValue: false
      })
    ]
  },

  async down(queryInterface, Sequelize) {
    queryInterface.removeColumn('academics', 'field_of_study')
    queryInterface.removeColumn('academics','achievement')
    queryInterface.removeColumn('academics', 'certificates')
  }
};
