'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('strands', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      strand_text: {
        type: Sequelize.STRING,
        allowNull: false
      },
      level_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: null
      },
      grade_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: null
      },
      subject_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: null
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      deleted_at: {
        allowNull: true,
        defaultValue: null,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('strands');
  }
};