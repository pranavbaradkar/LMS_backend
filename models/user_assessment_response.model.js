'use strict';

module.exports = (sequelize, DataTypes) => {
  var Model = sequelize.define('user_assessment_responses', {
    id            : { type: DataTypes.INTEGER(11), allowNull: false, autoIncrement: true, primaryKey: true },
    user_id       : { type: DataTypes.INTEGER, allowNull: false },
    assessment_id : { type: DataTypes.INTEGER, allowNull: false },
    response_json : { type: DataTypes.TEXT, allowNull: false },
    type          : { type: DataTypes.ENUM('SCREENING', 'MAINS'), defaultValue: 'SCREENING' },
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