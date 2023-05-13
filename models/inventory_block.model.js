'use strict';
module.exports = (sequelize, DataTypes) => {
    var Model = sequelize.define('inventory_blocks', {
        id             : { type: DataTypes.INTEGER(11), allowNull: false, autoIncrement: true, primaryKey: true },
        user_id        : { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
        code           : { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
        inventory_type : { type: DataTypes.ENUM("LAPTOP", "LAPTOP_WITH_CAMERA", "PC", "PC_WITH_CAMERA"), allowNull: false, defaultValue: 'LAPTOP' },
        status         : { type: DataTypes.ENUM("BLOCKED", "RELEASED"), allowNull: false, defaultValue: 'BLOCKED' },
        deleted_at     : { type: DataTypes.DATE, allowNull: true, defaultValue: null }
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