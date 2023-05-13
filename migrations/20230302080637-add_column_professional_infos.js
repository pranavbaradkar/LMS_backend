'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {

    return [
      queryInterface.addColumn('professional_infos', 'school_id',{
        type: Sequelize.INTEGER,
        allowNull: true,
      }),
      queryInterface.addColumn('professional_infos', 'other_name',{
         type: Sequelize.STRING, 
         allowNull: true
      }),
      queryInterface.addColumn('professional_infos', 'country_id',{
        type: Sequelize.INTEGER, 
        allowNull: true
      }),
      queryInterface.addColumn('professional_infos', 'state_id',{
        type: Sequelize.INTEGER, 
        allowNull: true
      }),
      queryInterface.addColumn('professional_infos', 'city_id',{
       type: Sequelize.INTEGER, 
       allowNull: true
      }),
      queryInterface.addColumn('professional_infos', 'district_id',{
        type: Sequelize.INTEGER, 
        allowNull: true
       }),
       queryInterface.addColumn('professional_infos', 'taluka_id',{
        type: Sequelize.INTEGER, 
        allowNull: true
       }),
       queryInterface.addColumn('professional_infos', 'address',{
        type: Sequelize.STRING, 
        allowNull: true
       }),
       queryInterface.addColumn('professional_infos', 'is_role',{
        type: Sequelize.BOOLEAN, 
        defaultValue: true
       }),
       queryInterface.addColumn('professional_infos', 'start_date',{
        type: Sequelize.STRING, 
        allowNull: false
       }),
       queryInterface.addColumn('professional_infos', 'end_date',{
        type: Sequelize.STRING, 
        allowNull: true
       }),
       queryInterface.changeColumn('professional_infos', 'level_id',{
        type: Sequelize.STRING, 
        allowNull: true
       }),
       queryInterface.changeColumn('professional_infos', 'subject_id',{
        type: Sequelize.STRING, 
        allowNull: true
       }),
    ]
  },

  async down (queryInterface, Sequelize) {
    queryInterface.removeColumn('professional_infos', 'school_id')
    queryInterface.removeColumn('professional_infos', 'other_name')
    queryInterface.removeColumn('professional_infos', 'country_id')
    queryInterface.removeColumn('professional_infos', 'state_id')
    queryInterface.removeColumn('professional_infos', 'city_id')
    queryInterface.removeColumn('professional_infos', 'district_id')
    queryInterface.removeColumn('professional_infos', 'taluka_id')
    queryInterface.removeColumn('professional_infos', 'address')
    queryInterface.removeColumn('professional_infos', 'is_role')
    queryInterface.removeColumn('professional_infos', 'start_date')
    queryInterface.removeColumn('professional_infos', 'end_date')
  }
};
