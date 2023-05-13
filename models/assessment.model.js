'use strict';


module.exports = (sequelize, DataTypes) => {
    var Model = sequelize.define('assessments', {
        id           : { type: DataTypes.INTEGER(11), autoIncrement: true, allowNull: false, primaryKey: true },
        name         : { type: DataTypes.STRING, allowNull: false },
        score_type   : { type: DataTypes.ENUM('QUESTION', 'ASSESSMENT'), allowNull: false },
        instructions : { type: DataTypes.TEXT, allowNull : true },
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