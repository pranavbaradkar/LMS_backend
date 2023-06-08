'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    return  [
      queryInterface.addColumn('lo_questions', 'strand_id', { type: Sequelize.INTEGER, allowNull: true, }),
      queryInterface.addColumn('lo_questions', 'sub_strand_id', { type: Sequelize.INTEGER, allowNull: true, }),
      queryInterface.addColumn('lo_questions', 'topic_id', { type: Sequelize.INTEGER, allowNull: true, }),
      queryInterface.addColumn('lo_questions', 'hint', { type: Sequelize.TEXT, allowNull: true, }),
      queryInterface.addColumn('lo_questions', 'knowledge_level', { type: Sequelize.ENUM('MUST_KNOW', 'SHOULD_KNOW', 'NICE_TO_KNOW'), allowNull: true, }),
      queryInterface.addColumn('lo_questions', 'proficiency_level', { type: Sequelize.ENUM('A1', 'A2', 'B1', 'B2', 'C1', 'C2'), allowNull: true, }),
    ];
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    return [
      queryInterface.removeColumn('lo_questions', 'strand_id'),
      queryInterface.removeColumn('lo_questions', 'sub_strand_id'),
      queryInterface.removeColumn('lo_questions', 'topic_id'),
      queryInterface.removeColumn('lo_questions', 'hint'),
      queryInterface.removeColumn('lo_questions', 'knowledge_level'),
      queryInterface.removeColumn('lo_questions', 'proficiency_level'),
    ]
  }
};

 