"use strict";
const bcrypt = require("bcrypt");
const bcrypt_p = require("bcrypt-promise");
const jwt = require("jsonwebtoken");
const { TE, to } = require("../services/util.service");
const { CONFIG } = require("../config/config");

module.exports = (sequelize, DataTypes) => {
  var Model = sequelize.define("users", {
    id                 : { type: DataTypes.INTEGER(11), autoIncrement: true, allowNull: false, primaryKey: true },
    is_logged_in       : { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    uuid               : { type: DataTypes.STRING, allowNull: true, defaultValue: 0 },
    profile_pic        : { type: DataTypes.TEXT, allowNull: true },
    title              : { type: DataTypes.ENUM, defaultValue: "Ms", values: ["Ms", "Mrs", "Mr"] },
    first_name         : { type: DataTypes.STRING, allowNull: true },
    middle_name        : { type: DataTypes.STRING, allowNull: true, fieldName: 'middleName' },
    last_name          : { type: DataTypes.STRING, allowNull: true, as: 'lastName' },
    email              : { type: DataTypes.STRING, allowNull: true },
    user_type          : { type: DataTypes.ENUM, allowNull: false, defaultValue: "JOB_SEEKER", values: ["TEACHER", "JOB_SEEKER"] },
    is_email_verified  : { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false, as: 'isEmailVerified' },
    country_code       : { type: DataTypes.STRING(5), allowNull: true, defaultValue: null },
    phone_no           : { type: DataTypes.STRING, as: 'phoneNo' },
    is_phone_verified  : { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    password           : { type: DataTypes.STRING, allowNull: true },
    otp                : { type: DataTypes.STRING, allowNull: true },
    otp_expire         : { type: DataTypes.DATE, allowNull: true },
    dob                : { type: DataTypes.DATEONLY, allowNull: true },
    gender             : { type: DataTypes.ENUM("MALE", "FEMALE"), allowNull: true },
    latitude           : { type: DataTypes.DECIMAL(10, 8), allowNull: true },
    longitude          : { type: DataTypes.DECIMAL(11, 8), allowNull: true },
    step               : { type: DataTypes.SMALLINT, allowNull: false, defaultValue: 1 },
    country_id         : { type: DataTypes.INTEGER(11), allowNull: true },
    country_name       : { type: DataTypes.STRING, allowNull: true, defaultValue: null },
    state_id           : { type: DataTypes.INTEGER(11), allowNull: true },
    state_name         : { type: DataTypes.STRING, allowNull: true, defaultValue: null },
    city_id            : { type: DataTypes.INTEGER(11), allowNull: true },
    city_name          : { type: DataTypes.STRING, allowNull: true, defaultValue: null },
    district_name      : { type: DataTypes.STRING, allowNull: true, defaultValue: null },
    taluka_name        : { type: DataTypes.STRING, allowNull: true, defaultValue: null },
    status             : { type: DataTypes.ENUM("PENDING", "ACTIVE", "INACTIVE", "BLOCK"), allowNull: false, defaultValue: "ACTIVE" },
    address            : { type: DataTypes.STRING, allowNull: true, },
    pincode            : { type: DataTypes.INTEGER, allowNull: true, validate: { len: { args: [6, 6], msg: "pin code must 6 digit." }, isNumeric: { msg: "not a valid pin code." } } },
    is_deleted         : { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    invite_code        : { type: DataTypes.STRING, allowNull: true },
    invited_at         : { type: DataTypes.DATE, allowNull: true },
    is_profile_created : { type: DataTypes.BOOLEAN, defaultValue: false },
    employee_code      : { type: DataTypes.STRING, allowNull: true, defaultValue: null },
    deleted_at         : { type: DataTypes.DATE, allowNull: true, defaultValue: null }

  },
  {
    timestamps: true,
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at'
  });

  Model.beforeSave(async (user, options) => {
    let err;
    if (user.changed("password")) {
      let salt, hash;
      [err, salt] = await to(bcrypt.genSalt(10));
      if (err) TE(err.message, true);

      [err, hash] = await to(bcrypt.hash(user.password, salt));
      if (err) TE(err.message, true);

      user.password = hash;
    }
  });

  

  Model.prototype.comparePassword = async function (pw) {
    let err, pass;
    if (!this.password) TE("password not set");

    [err, pass] = await to(bcrypt_p.compare(pw, this.password));
    if (err) TE(err);

    if (!pass) TE("invalid password");

    return this;
  };

  Model.prototype.getJWT = function () {
    let expiration_time = parseInt(CONFIG.jwt_expiration);
    return (
      "Bearer " +
      jwt.sign({ user_id: this.id }, CONFIG.jwt_encryption, {
        expiresIn: expiration_time
      })
    );
  };

  Model.prototype.toWeb = function (pw) {
    let json = this.toJSON();
    return json;
  };
  return Model;
};
