'use strict';


module.exports = (sequelize, DataTypes) => {
  var Model = sequelize.define('campaigns', {
    id            : { type: DataTypes.INTEGER(11), allowNull: false, autoIncrement: true, primaryKey: true },
    name          : { type: DataTypes.STRING, allowNull: true },
    user_id       : { type: DataTypes.INTEGER, allowNull: false },
    start_date    : { type: DataTypes.DATE, allowNull: false },
    end_date      : { type: DataTypes.DATE, allowNull: false },
    start_time    : { type: DataTypes.DATE, allowNull: true, defaultValue: null },
    end_time      : { type: DataTypes.DATE, allowNull: true, defaultValue: null },
    level_ids     : { type: DataTypes.JSONB, allowNull: false },
    cluster_ids   : { type: DataTypes.JSONB, allowNull: true, defaultValue: null },
    school_ids    : { type: DataTypes.JSONB, allowNull: true, defaultValue: null },
    subject_ids   : { type: DataTypes.JSONB, allowNull: true, defaultValue: null },
    skill_ids     : { type: DataTypes.JSONB, allowNull: true, defaultValue: null },
    audience_type : { type: DataTypes.ENUM, defaultValue: "TEACHER", values: ["TEACHER", "JOB_SEEKER"] },
    deleted_at    : { type: DataTypes.DATE, allowNull: true, defaultValue: null }
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