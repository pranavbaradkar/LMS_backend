'use strict';
module.exports = (sequelize, DataTypes) => {
    var Model = sequelize.define('school_inventories', {
        id                               : { type: DataTypes.INTEGER(11), allowNull: false, autoIncrement: true, primaryKey: true },
        code                             : { type: DataTypes.INTEGER, allowNull: true, defaultValue: 0 },
        no_of_computer_labs              : { type: DataTypes.INTEGER, allowNull: true, defaultValue: 0 },
        lab_school_hours_available       : { type: DataTypes.INTEGER, allowNull: true, defaultValue: 0 },
        lab_after_school_hours_available : { type: DataTypes.INTEGER, llowNull: true, defaultValue: 0 },
        no_of_laptop_labs                : { type: DataTypes.INTEGER, allowNull: true, defaultValue: 0 },
        no_of_laptop_camera_labs         : { type: DataTypes.INTEGER, allowNull: true, defaultValue: 0 },
        no_of_pc_labs                    : { type: DataTypes.INTEGER, allowNull: true, defaultValue: 0 },
        no_of_pc_camera_labs             : { type: DataTypes.INTEGER, allowNull: true, defaultValue: 0 },
        default_browser                   : { type: DataTypes.STRING, allowNull: true, defaultValue: null },
        internet_bandwidth               : { type: DataTypes.ENUM("0-40", "40-50", "50-100", "100-200"), allowNull: false, defaultValue: '0-40' },
        ups_backup                       : { type: DataTypes.ENUM("AVAILABLE", "NOT_AVAILABLE"), allowNull: true, defaultValue: "AVAILABLE" },
        duration_ups_backup              : { type: DataTypes.FLOAT, allowNull: true, },
        dg_system                        : { type: DataTypes.ENUM("AVAILABLE", "NOT_AVAILABLE"), allowNull: true, defaultValue: "AVAILABLE" },
        deleted_at                       : { type: DataTypes.DATE, allowNull: true, defaultValue: null }
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