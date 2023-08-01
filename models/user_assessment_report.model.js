'use strict';

module.exports = (sequelize, DataTypes) => {
  var Model = sequelize.define('user_assessment_reports', {
    id                   : { type: DataTypes.INTEGER(11), allowNull: false, autoIncrement: true, primaryKey: true },
    user_id              : { type: DataTypes.INTEGER, allowNull: false },
    assessment_id        : { type: DataTypes.INTEGER, allowNull: false },
    assessment_type      : { type: DataTypes.STRING, allowNull: false },
    result               : { type: DataTypes.STRING, allowNull: false },
    percentile           : { type: DataTypes.DECIMAL, allowNull: false },
    skill_score          : { type: DataTypes.INTEGER, allowNull: false },
    subject_score        : { type: DataTypes.INTEGER, allowNull: false },
    skill_total          : { type: DataTypes.INTEGER, allowNull: false },
    total                : { type: DataTypes.INTEGER, allowNull: false },
    total_scored         : { type: DataTypes.INTEGER, allowNull: false },
    question_id          : { type: DataTypes.INTEGER, allowNull: false },
    is_correct           : { type: DataTypes.BOOLEAN, allowNull: false },
    score                : { type: DataTypes.INTEGER, allowNull: false },
    lo_ids               : { type: DataTypes.STRING, allowNull: true },
    skill_id             : { type: DataTypes.INTEGER, allowNull: true },
    skill_name           : { type: DataTypes.STRING, allowNull: true },
    level_id             : { type: DataTypes.INTEGER, allowNull: true },
    level_name           : { type: DataTypes.STRING, allowNull: true },
    grade_id             : { type: DataTypes.INTEGER, allowNull: true },
    grade_name           : { type: DataTypes.STRING, allowNull: true },
    subject_id           : { type: DataTypes.INTEGER, allowNull: true },
    strand_id            : { type: DataTypes.INTEGER, allowNull: true },
    sub_strand_id        : { type: DataTypes.INTEGER, allowNull: true },
    topic_id             : { type: DataTypes.INTEGER, allowNull: true },
    blooms_taxonomy      : { type: DataTypes.STRING, allowNull: true },
    difficulty_level     : { type: DataTypes.STRING, allowNull: true },
    complexity_level     : { type: DataTypes.STRING, allowNull: false, },
    deleted_at    : { type: DataTypes.DATE, allowNull: true, defaultValue: null }
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