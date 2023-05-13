'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.createTable('user_teaching_interests', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
      },
      user_id : { 
        type: Sequelize.INTEGER, 
        allowNull:false,
      },
      level_ids : { 
        type: Sequelize.JSONB, 
        allowNull:true,
        defaultValue: null
      },
      school_ids : { 
        type: Sequelize.JSONB, 
        allowNull:true,
        defaultValue: null
      },
      board_ids : { 
        type: Sequelize.JSONB, 
        allowNull:true,
        defaultValue: null
      },
      subject_ids : { 
        type: Sequelize.JSONB, 
        allowNull:true,
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
        type: Sequelize.DATE
      },
    });
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};
