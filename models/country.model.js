'use strict';
module.exports = (sequelize, DataTypes) => {
    var Model = sequelize.define('countries', {
        id           : { type: DataTypes.INTEGER(11), allowNull: false, autoIncrement: true, primaryKey: true },
        country_name : { type: DataTypes.STRING, allowNull: false},
        country_code : { type: DataTypes.STRING(5), allowNull: true, defaultValue: null },
        iso_code     : { type: DataTypes.STRING(5), allowNull: true, defaultValue: null },
        deleted_at   : { type: DataTypes.DATE, allowNull: true, defaultValue: null }
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