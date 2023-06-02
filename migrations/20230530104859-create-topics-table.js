'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('topics', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      topic_text: {
        type: Sequelize.STRING,
        allowNull: false
      },
      level_id: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      grade_id: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      subject_id: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      strand_id: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      sub_strand_id: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      skill_id: {
        type: Sequelize.INTEGER,
        allowNull: true
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
    return queryInterface.dropTable('topics');
  }
};