'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {

    return [
      queryInterface.addColumn('users', 'addresss',{
        type: Sequelize.STRING,
        allowNull: true,
      }),

      queryInterface.addColumn('users', 'pincode',{
         type: Sequelize.INTEGER, 
         allowNull: true
      }),

    ]
  },

  async down (queryInterface, Sequelize) {

    queryInterface.removeColumn('users', 'addresss'),
    queryInterface.removeColumn('users', 'pincode')

  }
};
