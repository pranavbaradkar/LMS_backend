'use strict';


module.exports = (sequelize, DataTypes) => {
  var Model = sequelize.define('skills', {
    id                   : { type: DataTypes.INTEGER(11), allowNull: false, autoIncrement: true, primaryKey: true },
    name                 : { type: DataTypes.STRING, allowNull: false },
    is_include_subject   : { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    description          : { type: DataTypes.TEXT, allowNull: true, defaultValue: null },
    grade_id             : { type: DataTypes.INTEGER(11), allowNull: true, defaultValue: 0 },
    level_id             : { type: DataTypes.INTEGER(11), allowNull: true, defaultValue: 0 },
    novice_min           : { type: DataTypes.INTEGER, allowNull: true, defaultValue:0 },
    novice_max           : { type: DataTypes.INTEGER, allowNull: true, defaultValue:0 },
    advance_begineer_min : { type: DataTypes.INTEGER, allowNull: true, defaultValue:0 },
    advance_begineer_max : { type: DataTypes.INTEGER, allowNull: true, defaultValue:0 },
    competent_min        : { type: DataTypes.INTEGER, allowNull: true, defaultValue:0 },
    competent_max        : { type: DataTypes.INTEGER, allowNull: true, defaultValue:0 },
    proficient_min       : { type: DataTypes.INTEGER, allowNull: true, defaultValue:0 },
    proficient_max       : { type: DataTypes.INTEGER, allowNull: true, defaultValue:0 },
    expert_min           : { type: DataTypes.INTEGER, allowNull: true, defaultValue:0 },
    expert_max           : { type: DataTypes.INTEGER, allowNull: true, defaultValue:0 },
    deleted_at           : { type: DataTypes.DATE, allowNull: true, defaultValue: null }
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