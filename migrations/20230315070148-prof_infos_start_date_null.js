'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
 
    return queryInterface.changeColumn('professional_infos', 'start_date', {
      type: Sequelize.DATE,
      allowNull: true,
    })
  },

  async down (queryInterface, Sequelize) {
  
  }
};
