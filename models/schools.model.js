'use strict';


module.exports = (sequelize, DataTypes) => {
  var Model = sequelize.define('schools', {
    id             : { type: DataTypes.INTEGER(11), allowNull: false, autoIncrement: true, primaryKey: true },
    name           : { type: DataTypes.STRING, allowNull: false },
    school_code    : { type: DataTypes.STRING, allowNull: true },
    email          : { type: DataTypes.STRING, allowNull: true },
    brand_id       : { type: DataTypes.INTEGER(11), allowNull: true },
    address        : { type: DataTypes.TEXT, allowNull: false },
    pincode        : { type: DataTypes.INTEGER, allowNull: true },
    contact        : { type: DataTypes.STRING, allowNull: false },
    website        : { type: DataTypes.TEXT, allowNull: false },
    cluster_id     : { type: DataTypes.INTEGER(11), allowNull: false },
    total_strength : { type: DataTypes.INTEGER(11), allowNull: false, default: 0 },
    country_id     : { type: DataTypes.INTEGER, allowNull: true },
    state_id       : { type: DataTypes.INTEGER, allowNull: false },
    city_id        : { type: DataTypes.INTEGER, allowNull: false },
    taluka_id      : { type: DataTypes.INTEGER, allowNull : true },
    district_id    : { type: DataTypes.INTEGER, allowNull : true },
    academic_date  : { type: DataTypes.DATEONLY, allowNull: true },
    deleted_at     : { type: DataTypes.DATE, allowNull: true, defaultValue: null }
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