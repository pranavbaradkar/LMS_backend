'use strict';


module.exports = (sequelize, DataTypes) => {
  var Model = sequelize.define('user_communications', {
    id         : { type: DataTypes.INTEGER(11), allowNull: false, autoIncrement: true, primaryKey: true },
    user_id    : { type: DataTypes.INTEGER, allowNull: false, },
    context    : { type: DataTypes.STRING, allowNull: true },
    channel    : { type: DataTypes.STRING, allowNull: true },
    identifier : { type: DataTypes.STRING, allowNull: true },
    deleted_at : { type: DataTypes.DATE, allowNull: true, defaultValue: null }
  }, {
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