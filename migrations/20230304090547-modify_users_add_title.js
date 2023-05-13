'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {

    return queryInterface.addColumn('users', 'title', {
      type: Sequelize.ENUM,
      defaultValue: "Ms",
      values: ["Ms", "Mrs", "Mr"],
      after: 'profile_pic'
    },

    );
  },

  async down(queryInterface, Sequelize) {

    return queryInterface.removeColumn('users', 'title');
  }
};
