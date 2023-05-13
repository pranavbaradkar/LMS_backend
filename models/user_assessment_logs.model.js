'use strict';


module.exports = (sequelize, DataTypes) => {
  var Model = sequelize.define('user_assessment_logs', {
    id                        : { type: DataTypes.INTEGER(11), allowNull: false, autoIncrement: true, primaryKey: true },
    user_id                   : { type: DataTypes.INTEGER, allowNull: false, unique: true },
    assessment_id             : { type: DataTypes.INTEGER, allowNull: false, unique: true },
    elapsed_time              : { type: DataTypes.INTEGER, allowNull: false },
    assessment_type           : { type: DataTypes.ENUM('SCREENING', 'MAINS'), unique: true },
    answered_question         : { type: DataTypes.TEXT },
    created_at                : { type: DataTypes.DATE, allowNull: true, defaultValue: null },
    updated_at                : { type: DataTypes.DATE, allowNull: true, defaultValue: null },
    deleted_at                : { type: DataTypes.DATE, allowNull: true, defaultValue: null }
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