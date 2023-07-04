'use strict';


module.exports = (sequelize, DataTypes) => {
  var Model = sequelize.define('interviewers', {
    id             : { type: DataTypes.INTEGER(11), allowNull: false, autoIncrement: true, primaryKey: true },
    name           : { type: DataTypes.STRING, allowNull: false },
    email          : { type: DataTypes.STRING, allowNull: true },
    interview_slot : { type: 'TIMESTAMP', allowNull: true },
    school_id      : { type: DataTypes.INTEGER(11), allowNull: false },
    deleted_at     : { type: DataTypes.DATE, allowNull: true, defaultValue: null }
  },{
    underscored: true,
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