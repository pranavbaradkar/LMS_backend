'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {

    return queryInterface.addColumn('campaigns', 'user_id',
      {
        type: Sequelize.INTEGER,
        allowNull: false,
        after: "id"
      });
  },

  async down(queryInterface, Sequelize) {

    return queryInterface.dropColumn('campaigns');
  }
};
