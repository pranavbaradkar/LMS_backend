'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {

    return [
      queryInterface.addColumn('schools', 'taluka_id',{
        type: Sequelize.INTEGER,
        allowNull : true,
        after: 'city_id'
      }),
      queryInterface.addColumn('schools', 'district_id',{
        type: Sequelize.INTEGER,
        allowNull : true,
        after: 'taluka_id'
      }),
    ]
  },

  async down (queryInterface, Sequelize) {
    
  }
};
