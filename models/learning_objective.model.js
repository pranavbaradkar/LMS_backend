'use strict';


module.exports = (sequelize, DataTypes) => {
  var Model = sequelize.define('learning_objectives', {
    id                 : { type: DataTypes.INTEGER(11), allowNull: false, autoIncrement: true, primaryKey: true },
    name               : { type: DataTypes.STRING, allowNull: false },
    io_code            : { type: DataTypes.STRING, allowNull: false },
    prerequisite_lo_id : { type: DataTypes.STRING, allowNull: false },
    deleted_at         : { type: DataTypes.DATE, allowNull: true, defaultValue: null }
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