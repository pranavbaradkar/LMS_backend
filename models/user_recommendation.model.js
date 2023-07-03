'use strict';
module.exports = (sequelize, DataTypes) => {
    var Model = sequelize.define('user_recommendations', {
        id                         : { type: DataTypes.INTEGER(11), allowNull: false, autoIncrement: true, primaryKey: true },
        user_id                    : {type: DataTypes.INTEGER, allowNull: false },
        screening_score            : {type: DataTypes.INTEGER, allowNull: true},
        screening_score_total      : {type: DataTypes.INTEGER, allowNull: true},
        // screening_assessment_id    : {type: DataTypes.INTEGER, allowNull: true},
        mains_score                : {type: DataTypes.INTEGER, allowNull: true},
        mains_score_total          : {type: DataTypes.INTEGER, allowNull: true},
        // mains_assessment_id        : {type: DataTypes.INTEGER, allowNull: true},
        demo_score                 : {type: DataTypes.INTEGER, allowNull: true},
        demo_score_total           : {type: DataTypes.INTEGER, allowNull: true, 
                                    get() { 
                                        let total = this.getDataValue('demo_score_total');
                                        return total ? Math.round(total) : total;
                                    }
                                    },
        interview_score            : {type: DataTypes.INTEGER, allowNull: true},
        interview_score_total      : {type: DataTypes.INTEGER, allowNull: true},
        ai_recommendation          : {type: DataTypes.STRING, allowNull: true},
        status                     : {type: DataTypes.ENUM('NOT_SELECTED','SELECTED','INTERVIEW','MAINS_CLEARED','DEMO_SUBMITTED'), allowNull: true},
        recommendation_status      : {type: DataTypes.ENUM("PENDING", 'AGREE','DISAGREE'), allowNull: true},
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