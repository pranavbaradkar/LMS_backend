'use strict';

module.exports = (sequelize, DataTypes) => {
    var Model = sequelize.define('assessment_results', {
        id              : { type: DataTypes.INTEGER(11), autoIncrement: true, allowNull: false, primaryKey: true },
        user_id         : { type: DataTypes.INTEGER, allowNull: false },
        assessment_id   : { type: DataTypes.INTEGER, allowNull: false },
        skill_scores    : { type: DataTypes.STRING, allowNull: false, 
                            get: function() {  
                            let value = this.getDataValue('skill_scores');
                            return JSON.parse(value);
                            },
                            set: function(val) {
                            this.setDataValue('skill_scores', JSON.stringify(val));
                            }
                         },
        subject_scores  : { type: DataTypes.STRING, allowNull: false, 
                            get: function() {  
                            let value = this.getDataValue('subject_scores');
                            return JSON.parse(value);
                            },
                            set: function(val) {
                            this.setDataValue('subject_scores', JSON.stringify(val));
                            }
                         },
        skill_total     : { type: DataTypes.TEXT, allowNull: false, 
                            get: function() {  
                            let value = this.getDataValue('skill_total');
                            return JSON.parse(value);
                            },
                            set: function(val) {
                            this.setDataValue('skill_total', JSON.stringify(val));
                            }
                         },

        percentile      : { type: DataTypes.DECIMAL, allowNull: false },
        total           : { type: DataTypes.INTEGER, allowNull: false },
        total_scored    : { type: DataTypes.INTEGER, allowNull: false },
        type            : { type: DataTypes.ENUM('SCREENING', 'MAINS'), allowNull: false },
        result          : { type: DataTypes.ENUM('PASSED', 'FAILED'), allowNull: false },
        deleted_at      : { type: DataTypes.DATE, allowNull: true, defaultValue: null }
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