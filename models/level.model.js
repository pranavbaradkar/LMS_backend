'use strict';


module.exports = (sequelize, DataTypes) => {
  var Model = sequelize.define('levels', {
    id                : { type: DataTypes.INTEGER(11), allowNull: false, autoIncrement: true, primaryKey: true },
    name              : { type: DataTypes.STRING, allowNull: false },
    icon              : { type: DataTypes.TEXT, allowNull: true, defaultValue: null},
    school_id         : { type: DataTypes.INTEGER(11), allowNull: true },
    level_description : { type: DataTypes.TEXT, allowNull: false },
    board_id          : { type: DataTypes.INTEGER(11), allowNull: true },
    deleted_at        : { type: DataTypes.DATE, allowNull: true, defaultValue: null }
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