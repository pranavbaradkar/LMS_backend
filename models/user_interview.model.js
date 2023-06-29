'use strict';
module.exports = (sequelize, DataTypes) => {
  var Model = sequelize.define('user_interviews', {
    id               : { type: DataTypes.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true },
    user_id          : { type: DataTypes.INTEGER, allowNull: false },
    recommended_level: { type: DataTypes.INTEGER, allowNull: true },
    interview_slot   : { type: 'TIMESTAMP', allowNull: true, defaultValue: null },
    mode             : { type: DataTypes.STRING, allowNull: true, defaultValue: null },
    exam_location    : { type: DataTypes.STRING, allowNull: true, defaultValue: null },
    room_no          : { type: DataTypes.STRING, allowNull: true, defaultValue: null },
    status           : { type: DataTypes.ENUM('PENDING','NOT_RECOMMENDED', 'RECOMMENDED'), allowNull: true, defaultValue: null },
    interviewer      : { type: DataTypes.STRING, allowNull: true, defaultValue: null },
    interview_notes  : { type: DataTypes.TEXT, allowNull: true, defaultValue: null },
    interview_remark : { type: DataTypes.TEXT, allowNull: true, defaultValue: null },
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
    // Model.belongsTo(models.user_interview_feedbacks, {foreignKey: ['user_id','assessment_id'], as: "interview_feedback"});
  };
  return Model;
};