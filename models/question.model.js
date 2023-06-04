'use strict';


module.exports = (sequelize, DataTypes) => {
  var Model = sequelize.define('questions', {
    id                   : { type: DataTypes.INTEGER(11), autoIncrement: true, allowNull: false, primaryKey: true },
    question_type        : { type: DataTypes.ENUM('SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'FILL_IN_THE_BLANKS', 'TRUE_FALSE', 'MATCH_THE_FOLLOWING'), allowNull: false },
    statement            : { type: DataTypes.TEXT, allowNull: false },
    s3_asset_urls        : { type: DataTypes.TEXT, allowNull: true },
    mime_type            : { type: DataTypes.STRING, allowNull: true, defaultValue: null },
    answer_explanation   : { type: DataTypes.TEXT, allowNull: false },
    hint                 : { type: DataTypes.TEXT, allowNull: true },
    correct_answer       : { type: DataTypes.STRING, allowNull: false },
    difficulty_level     : { type: DataTypes.ENUM('EASY', 'MEDIUM', 'HARD', 'VERY_HARD'), allowNull: false, },
    complexity_level     : { type: DataTypes.ENUM('P1', 'P2', 'P3', 'P4', 'P5'), allowNull: false, },
    knowledge_level      : { type: DataTypes.ENUM('MUST_KNOW', 'SHOULD_KNOW', 'NICE_TO_KNOW'), allowNull: false, },
    proficiency_level    : { type: DataTypes.ENUM('A1', 'A2', 'B1', 'B2', 'C1', 'C2'), allowNull: true, defaultValue: null},
    blooms_taxonomy      : { type: DataTypes.ENUM('REMEMBER', 'UNDERSTAND', 'APPLY', 'ANALYZE', 'EVALUTE', 'CREATE'), allowNull: false, },
    skill_id             : { type: DataTypes.INTEGER(11), allowNull: false },
    estimated_time       : { type: DataTypes.INTEGER(11), allowNull: true, defaultValue: 0 },
    correct_answer_score : { type: DataTypes.FLOAT(5, 2), allowNull: true, defaultValue: 0 },
    answer               : { type: DataTypes.STRING, allowNull: true },
    level_id             : { type: DataTypes.INTEGER, allowNull: true },
    tags                 : { type: DataTypes.TEXT, allowNull: true },
    subject_id           : { type: DataTypes.INTEGER, allowNull: true },
    deleted_at           : { type: DataTypes.DATE, allowNull: true, defaultValue: null }
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