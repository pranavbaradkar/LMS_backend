'use strict';


module.exports = (sequelize, DataTypes) => {
  var Model = sequelize.define('user_assessment_logs', {
    id                        : { type: DataTypes.INTEGER(11), allowNull: false, autoIncrement: true, primaryKey: true },
    user_id                   : { type: DataTypes.INTEGER, allowNull: false, },
    assessment_id             : { type: DataTypes.INTEGER, allowNull: false, },
    question_id               : { type: DataTypes.INTEGER, allowNull: false, },
    elapsed_time              : { type: DataTypes.INTEGER, allowNull: false, },
    assessment_type           : { type: DataTypes.ENUM('SCREENING', 'MAINS') },
    question_status           : { type: DataTypes.ENUM('PROGRESS', 'COMPLETED', 'SKIPPED', 'PENDING'), defaultValue: 'PENDING' },
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