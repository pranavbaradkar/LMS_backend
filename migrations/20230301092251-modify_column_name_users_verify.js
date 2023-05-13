'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {

    return [

      queryInterface.renameColumn('users','is_email_verify','is_email_verified'),

      queryInterface.renameColumn('users','is_phone_verify','is_phone_verified')

    ]
  },

  async down(queryInterface, Sequelize) {

  }
};
