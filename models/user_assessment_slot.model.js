'use strict';


module.exports = (sequelize, DataTypes) => {
  var Model = sequelize.define('user_assessment_slots', {
    id                        : { type: DataTypes.INTEGER(11), allowNull: false, autoIncrement: true, primaryKey: true },
    user_id                   : { type: DataTypes.INTEGER, allowNull: false },
    slot                      : { type: DataTypes.DATE, allowNull: false },
    video_link                : { type: DataTypes.STRING, allowNull: true },
    padv_video_link           : { type: DataTypes.STRING, allowNull: true },
    demo_link                 : { type: DataTypes.STRING, allowNull: true },
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