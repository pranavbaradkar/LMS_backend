'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {

    return [
      queryInterface.changeColumn('professional_infos', 'employee_type_id',{
        type: Sequelize.INTEGER,
        allowNull: true,
      }),
      queryInterface.changeColumn('professional_infos', 'institute_id',{
         type: Sequelize.INTEGER, 
         allowNull: true
      }),
      queryInterface.changeColumn('professional_infos', 'board_id',{
        type: Sequelize.INTEGER, 
        allowNull: true
      }),
      queryInterface.changeColumn('professional_infos', 'level_id',{
        type: Sequelize.INTEGER, 
        allowNull: true
      }),
      queryInterface.changeColumn('professional_infos', 'subject_id',{
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
