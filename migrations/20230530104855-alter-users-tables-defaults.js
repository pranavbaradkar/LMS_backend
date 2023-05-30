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
    return [
      queryInterface.changeColumn('users', 'otp',{ type: Sequelize.STRING, allowNull: true, defaultValue: "" }),
      queryInterface.changeColumn('users', 'profile_pic', { type: Sequelize.TEXT, allowNull: true, defaultValue: "" }),
      queryInterface.changeColumn('users', 'first_name', { type: Sequelize.STRING, allowNull: true, defaultValue: "" }),
      queryInterface.changeColumn('users', 'middle_name', { type: Sequelize.STRING, allowNull: true, defaultValue: "", fieldName: 'middleName' }),
      queryInterface.changeColumn('users', 'last_name', { type: Sequelize.STRING, allowNull: true, defaultValue: "", as: 'lastName' }),
      queryInterface.changeColumn('users', 'email', { type: Sequelize.STRING, allowNull: true, defaultValue: "" }),
      queryInterface.changeColumn('users', 'country_code', { type: Sequelize.STRING(5), allowNull: true, defaultValue: "" }),
      queryInterface.changeColumn('users', 'phone_no', { type: Sequelize.STRING, as: 'phoneNo', defaultValue: "" }),
      queryInterface.changeColumn('users', 'password', { type: Sequelize.STRING, allowNull: true, defaultValue: "" }),
      queryInterface.changeColumn('users', 'otp', { type: Sequelize.STRING, allowNull: true, defaultValue: "" }),
      queryInterface.changeColumn('users', 'latitude', { type: Sequelize.DECIMAL(10, 8), allowNull: true, defaultValue: 0.0 }),
      queryInterface.changeColumn('users', 'longitude', { type: Sequelize.DECIMAL(11, 8), allowNull: true, defaultValue: 0.0 }),
      queryInterface.changeColumn('users', 'country_id', { type: Sequelize.INTEGER(11), allowNull: true, defaultValue: -1 }),
      queryInterface.changeColumn('users', 'country_name', { type: Sequelize.STRING, allowNull: true, defaultValue: "" }),
      queryInterface.changeColumn('users', 'state_id', { type: Sequelize.INTEGER(11), allowNull: true, defaultValue: -1 }),
      queryInterface.changeColumn('users', 'state_name', { type: Sequelize.STRING, allowNull: true, defaultValue: "" }),
      queryInterface.changeColumn('users', 'city_id', { type: Sequelize.INTEGER(11), allowNull: true, defaultValue: -1 }),
      queryInterface.changeColumn('users', 'city_name', { type: Sequelize.STRING, allowNull: true, defaultValue: "" }),
      queryInterface.changeColumn('users', 'district_id', { type: Sequelize.INTEGER, allowNull: true, defaultValue: -1 }),
      queryInterface.changeColumn('users', 'district_name', { type: Sequelize.STRING, allowNull: true, defaultValue: "" }),
      queryInterface.changeColumn('users', 'taluka_id', { type: Sequelize.INTEGER, allowNull: true, defaultValue: -1 }),
      queryInterface.changeColumn('users', 'taluka_name', { type: Sequelize.STRING, allowNull: true, defaultValue: "" }),
      queryInterface.changeColumn('users', 'address', { type: Sequelize.STRING, allowNull: true, defaultValue: "" }),
      queryInterface.changeColumn('users', 'pincode', { type: Sequelize.INTEGER, allowNull: true, defaultValue: 0, validate: { len: { args: [6, 6], msg: "pin code must 6 digit." }, isNumeric: { msg: "not a valid pin code." } } }),
      queryInterface.changeColumn('users', 'invite_code', { type: Sequelize.STRING, allowNull: true, defaultValue: "" }),
      queryInterface.changeColumn('users', 'employee_code', { type: Sequelize.STRING, allowNull: true, defaultValue: "" }),
    ]
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};


