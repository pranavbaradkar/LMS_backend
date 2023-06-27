'use strict';
module.exports = (sequelize, DataTypes) => {
  var Model = sequelize.define('demovideo_details', {
    id               : { type: DataTypes.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true },
    user_id          : { type: DataTypes.INTEGER, allowNull: false },
    assessment_id    : { type: DataTypes.INTEGER, allowNull: true },
    subject_id       : { type: DataTypes.INTEGER, allowNull: true },
    grade_id         : { type: DataTypes.INTEGER, allowNull: true },
    video_link       : { type: DataTypes.STRING, allowNull: true },
    total_score      : { type: DataTypes.INTEGER, allowNull: true },
    scores           : { type: DataTypes.STRING, allowNull: true, 
                        get: function() {  
                        let value = this.getDataValue('scores');
                        return JSON.parse(value);
                        },
                        set: function(val) {
                        this.setDataValue('scores', JSON.stringify(val));
                        }
                      },
    demo_topic       : { type: DataTypes.STRING, allowNull: false },
    demo_description : { type: DataTypes.TEXT, allowNull: true, 
                      get: function() {  
                        let value = this.getDataValue('demo_description');
                        return JSON.parse(value);
                      },
                      set: function(val) {
                        this.setDataValue('demo_description', JSON.stringify(val));
                      }
                      },
    status           : { type: DataTypes.ENUM('PENDING', 'SUBMITTED', 'AI_STATUS_COMPLETED', 'MANUAL_STATUS_COMPLETED', 'PASSED', 'FAILED','NOT_RECOMMENDED', 'RECOMMENDED'), allowNull: false, defaultValue: 'PENDING' },
    deleted_at       : { type: DataTypes.DATE, allowNull: true, defaultValue: null }
  },{
    underscored: true,
    timestamps: true,
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at'
  });

  Model.associate = (models)=> {
    Model.belongsTo(models.subjects, {foreignKey: 'subject_id'});
    Model.belongsTo(models.grades, {foreignKey: 'grade_id'});
  };
  return Model;
};