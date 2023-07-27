"use strict";
const bcrypt = require("bcrypt");
const bcrypt_p = require("bcrypt-promise");
const jwt = require("jsonwebtoken");
const { TE, to } = require("../services/util.service");
const { CONFIG } = require("../config/config");

module.exports = (sequelize, DataTypes) => {
  var Model = sequelize.define("admins", {
    title      : { type: DataTypes.ENUM, defaultValue: "Mr", values: ["Ms", "Mrs", "Mr"] },
    first      :         DataTypes.STRING,
    middle     : { type: DataTypes.STRING, allowNull: true },
    last       :         DataTypes.STRING,
    email      : { type: DataTypes.STRING, unique: true, validate: { isEmail: { msg: "Email is invalid." } }},
    password   : { type: DataTypes.STRING, allowNull: false },
    role_type  : { type: DataTypes.ENUM("SUPER_ADMIN", "USER"), allowNull: false, defaultValue: "USER" },
    role_id    : { type: DataTypes.INTEGER(11), allowNull: true },
    status     : { type: DataTypes.ENUM("ACTIVE", "INACTIVE", "PENDING", "BLOCKED"), allowNull: false, defaultValue: "ACTIVE" },
    is_deleted : { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    deleted_at : { type: DataTypes.DATE, allowNull: true, defaultValue: null },
    school_ids : { type: DataTypes.JSONB, allowNull: true},
  },{
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

  // Model.beforeUpdate(async (user, options) => {
  //   let err;
  //   if (user.changed("password")) {
  //     let salt, hash;
  //     [err, salt] = await to(bcrypt.genSalt(10));
  //     if (err) TE(err.message, true);

  //     [err, hash] = await to(bcrypt.hash(user.password, salt));
  //     if (err) TE(err.message, true);

  //     user.password = hash;
  //   }
  // });

  Model.prototype.comparePassword = async function(pw) {
    let err, pass;
    if (!this.password) TE("password not set");

    [err, pass] = await to(bcrypt_p.compare(pw, this.password));
    if (err) TE(err);

    if (!pass) TE("invalid password");

    return this;
  };

  Model.prototype.getJWT = function() {
    let expiration_time = parseInt(CONFIG.jwt_admin_expiration);
    return (
      "Bearer " +
      jwt.sign({ user_id: this.id }, CONFIG.jwt_admin_encryption, {
        expiresIn: expiration_time
      })
    );
  };
  Model.prototype.toWeb = function(pw) {
    let json = this.toJSON();
    return json;
  };
  return Model;
};
