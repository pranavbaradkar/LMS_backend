'use strict';
module.exports = (sequelize, DataTypes) => {
    var Model = sequelize.define('user_recommendations', {
        id                         : { type: DataTypes.INTEGER(11), allowNull: false, autoIncrement: true, primaryKey: true },
        user_id                    : {type: DataTypes.INTEGER, allowNull: false },
        screening_score            : {type: DataTypes.INTEGER, allowNull: true},
        screening_score_total      : {type: DataTypes.INTEGER, allowNull: true},
        mains_score                : {type: DataTypes.INTEGER, allowNull: true},
        mains_score_total          : {type: DataTypes.INTEGER, allowNull: true},
        demo_score                 : {type: DataTypes.INTEGER, allowNull: true},
        demo_score_total           : {type: DataTypes.INTEGER, allowNull: true},
        interview_score            : {type: DataTypes.INTEGER, allowNull: true},
        interview_score_total      : {type: DataTypes.INTEGER, allowNull: true},
        ai_recommendation          : {type: DataTypes.STRING, allowNull: true},
        status                     : {type: DataTypes.ENUM('AGREE', 'DISAGREE', 'PENDING'), allowNull: true},
        deleted_at                 : { type: DataTypes.DATE, allowNull: true, defaultValue: null }
     },{
        underscored: true,
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