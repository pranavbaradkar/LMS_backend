'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('personal_infos', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      profile_pic: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      first: {
        type: Sequelize.STRING,
        allowNull: true
      },
      middle: {
        type: Sequelize.STRING,
        allowNull: true
      },
      last: {
        type: Sequelize.STRING,
        allowNull: true
      },
      email: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      is_email_verify: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      phone: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      is_phone_verify: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      password: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      otp: {
        type: Sequelize.INTEGER,
        default: true,
        allowNull: true
      },
      otp_expire: {
        type: Sequelize.DATE,
        default: true,
        allowNull: true
      },
      dob: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      gender: {
        type: Sequelize.ENUM('MALE', 'FEMALE'),
        allowNull: true
      },
      latitude: {
        type: Sequelize.DECIMAL(10, 8),
        allowNull: true
      },
      longitude: {
        type: Sequelize.DECIMAL(11, 8),
        allowNull: true
      },
      step: {
        type: Sequelize.SMALLINT,
        allowNull: false,
        defaultValue: 1
      },
      country_id: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      state_id: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      city_id: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('PENDING', 'ACTIVE', 'INACTIVE', 'BLOCK'),
        allowNull: false,
        defaultValue: 'ACTIVE'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('personal_infos');
  }
};