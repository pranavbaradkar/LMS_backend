'use strict';


module.exports = (sequelize, DataTypes) => {
  var Model = sequelize.define('assessment_configurations', {
    id                      : { type: DataTypes.INTEGER(11), allowNull: false, autoIncrement: true, primaryKey: true },
    assessment_id           : { type: DataTypes.INTEGER, allowNull: false },
    skill_distributions     : { type: DataTypes.JSONB, allowNull: true },
    difficulty_level        : { type: DataTypes.TEXT, allowNull: false },
    total_no_of_questions   : { type: DataTypes.INTEGER, allowNull: false, },
    level_id                : { type: DataTypes.INTEGER, allowNull: true, },
    correct_score_answer    : { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    negative_marking        : { type: DataTypes.ENUM('YES', 'NO'), allowNull: false, defaultValue: 'NO' },
    duration_of_assessment  : { type: DataTypes.INTEGER, allowNull: true },
    randomize_questions     : { type: DataTypes.ENUM('YES', 'NO'), allowNull: false, defaultValue: 'NO' },
    shuffle_questions       : { type: DataTypes.ENUM('YES', 'NO'), allowNull: false, defaultValue: 'NO' },
    display_correct_answer  : { type: DataTypes.ENUM('YES', 'NO'), allowNull: false, defaultValue: 'NO' },
    display_result          : { type: DataTypes.ENUM('YES', 'NO'), allowNull: false, defaultValue: 'NO' },
    passing_criteria        : { type: DataTypes.INTEGER, allowNull: true, },
    time_up_first_remainder : { type: DataTypes.INTEGER, allowNull: true, },
    time_up_last_remainder  : { type: DataTypes.INTEGER, allowNull: true, },
    assessment_type         : { type: DataTypes.ENUM('SCREENING', 'MAINS'), allowNull: false, defaultValue: 'SCREENING' },
    deleted_at              : { type: DataTypes.DATE, allowNull: true, defaultValue: null }
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