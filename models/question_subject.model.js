'use strict';


module.exports = (sequelize, DataTypes) => {
  var Model = sequelize.define('question_subjects', {
    id          : { type: DataTypes.INTEGER(11), autoIncrement: true, allowNull: false, primaryKey: true },
    question_id : { type: DataTypes.INTEGER(11), allowNull: false },
    subject_id  : { type: DataTypes.INTEGER(11), allowNull: false },
    skill_id    : { type: DataTypes.INTEGER(11), allowNull: true },
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