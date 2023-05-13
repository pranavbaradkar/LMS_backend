'use strict';


module.exports = (sequelize, DataTypes) => {
  var Model = sequelize.define('academics', {
    id                          : { type: DataTypes.INTEGER(11), autoIncrement: true, allowNull: false, primaryKey: true },
    user_id                     : { type: DataTypes.INTEGER(11), allowNull: false },
    institution                 : { type: DataTypes.TEXT, allowNull: false },
    programme                   : { type: DataTypes.TEXT, allowNull: false },
    start_date                  : { type: DataTypes.DATE, allowNull: true, defaultValue: null },
    end_date                    : { type: DataTypes.DATE, allowNull: true, defaultValue: null },
    field_of_study              : { type: DataTypes.TEXT, allowNull: false },
    extra_carricular_activities : { type: DataTypes.TEXT, allowNull: true },
    grade_score                 : { type: DataTypes.FLOAT, allowNull: true },
    grade_type                  : { type: DataTypes.STRING, allowNull: true },
    achievements                : { type: DataTypes.TEXT, allowNull: true },
    certificate_url             : { type: DataTypes.TEXT, allowNull: true },
    deleted_at                  : { type: DataTypes.DATE, allowNull: true, defaultValue: null }
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