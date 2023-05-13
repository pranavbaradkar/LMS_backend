'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {

    return queryInterface.changeColumn('question_subjects','skill_id', {

      type: Sequelize.INTEGER,
      allowNull: true
    });
  },
  down: (queryInterface, Sequelize) => {
   
  }
};
