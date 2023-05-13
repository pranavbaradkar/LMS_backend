'use strict';


module.exports = (sequelize, DataTypes) => {
  var Model = sequelize.define('question_los', {
    id          : { type: DataTypes.INTEGER(11), allowNull: false, autoIncrement: true, primaryKey: true },
    question_id : { type: DataTypes.INTEGER, allowNull: true },
    lo_id       : { type: DataTypes.INTEGER, allowNull: true },
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