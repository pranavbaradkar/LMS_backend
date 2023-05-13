"use strict";
const bcrypt = require("bcrypt");
const bcrypt_p = require("bcrypt-promise");
const jwt = require("jsonwebtoken");
const { TE, to } = require("../services/util.service");
const { CONFIG } = require("../config/config");

module.exports = (sequelize, DataTypes) => {
  var Model = sequelize.define("campaign_schools", {
    id          : { type: DataTypes.INTEGER(11), autoIncrement: true, allowNull: false, primaryKey: true },
    campaign_id : { type: DataTypes.INTEGER, allowNull: false, },
    school_id   : { type: DataTypes.INTEGER, allowNull: false, },
    cluster_id  : { type: DataTypes.INTEGER, allowNull: false, }
  },
    {
      timestamps: true,
      paranoid: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at'
    });

  Model.prototype.toWeb = function (pw) {
    let json = this.toJSON();
    return json;
  };
  return Model;
};
