'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {

    return [
      queryInterface.addColumn('assessments', 'instructions',{
        type: Sequelize.TEXT,
        allowNull : true,
        after: 'score_type'
      }),
    ]
  },

  async down (queryInterface, Sequelize) {
    
  }
};
