'use strict';


module.exports = (sequelize, DataTypes) => {
  var Model = sequelize.define('school_grades', {
    id         : { type: DataTypes.INTEGER(11), allowNull: false, autoIncrement: true, primaryKey: true },
    school_id  : { type: DataTypes.INTEGER, allowNull: false },
    grade_id   : { type: DataTypes.INTEGER, allowNull: false },
    deleted_at : { type: DataTypes.DATE, allowNull: true, defaultValue: null }
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