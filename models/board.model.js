'use strict';


module.exports = (sequelize, DataTypes) => {
  var Model = sequelize.define('boards', {
    id          : { type: DataTypes.INTEGER(11), allowNull: false, autoIncrement: true, primaryKey: true },
    name        : { type: DataTypes.STRING, allowNull: false },
    logo        : { type: DataTypes.TEXT, allowNull: false },
    type        : { type: DataTypes.ENUM('NATIONAL', 'INTERNATIONAL', 'STATE'), allowNull: false },
    school_id   : { type: DataTypes.INTEGER,  default: null, allowNull: true },
    brand_id    : { type: DataTypes.INTEGER,  default: null, allowNull: true },
    description : { type: DataTypes.TEXT, allowNull: true },
    deleted_at  : { type: DataTypes.DATE, allowNull: true, defaultValue: null }
  },{
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