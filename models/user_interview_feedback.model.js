'use strict';
module.exports = (sequelize, DataTypes) => {
  var Model = sequelize.define('user_interview_feedbacks', {
    id                      : { type: DataTypes.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true },
    user_id                 : { type: DataTypes.INTEGER, allowNull: false },
    // assessment_id           : { type: DataTypes.INTEGER, allowNull: false },
    about_candidate         : { type: DataTypes.TEXT, allowNull: true, defaultValue: null },
    candidate_past          : { type: DataTypes.TEXT, allowNull: true, defaultValue: null },
    ctc_current             : { type: DataTypes.STRING, allowNull: true, defaultValue: null },
    ctc_expected            : { type: DataTypes.STRING, allowNull: true, defaultValue: null },
    teaching_grades         : { type: DataTypes.JSONB, allowNull: true, defaultValue: null },
    teaching_boards         : { type: DataTypes.JSONB, allowNull: true, defaultValue: null },
    confidence_score        : { type: DataTypes.INTEGER, allowNull: true, defaultValue: null },
    appearence_score        : { type: DataTypes.INTEGER, allowNull: true, defaultValue: null },
    overall_rating          : { type: DataTypes.INTEGER, allowNull: true, defaultValue: null },
    interview_notes         : { type: DataTypes.TEXT, allowNull: true, defaultValue: null },
    offer_selection         : { type: DataTypes.ENUM('YES','NO', 'MAYBE'), allowNull: true, defaultValue: null },
    deleted_at              : { type: DataTypes.DATE, allowNull: true, defaultValue: null }
  },{
    underscored: true,
    timestamps: true,
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at'
  });

  Model.associate = (models)=> {
    // Model.belongsTo(models.user_interviews, {foreignKey: ['user_id', 'assessment_id']});
  };
  return Model;
};