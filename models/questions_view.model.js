'use strict';

module.exports = (sequelize, DataTypes) => {
  var Model = sequelize.define('question_views', {
    id                   : { type: DataTypes.INTEGER(11), autoIncrement: true, allowNull: false, primaryKey: true },
    // lo_ids               : { type: DataTypes.TEXT, allowNull: true },
    skill_id             : { type: DataTypes.INTEGER, allowNull: true },
    level_id             : { type: DataTypes.INTEGER, allowNull: true },
    grade_id             : { type: DataTypes.INTEGER, allowNull: true },
    subject_id           : { type: DataTypes.INTEGER, allowNull: true },
    strand_id            : { type: DataTypes.INTEGER, allowNull: true },
    sub_strand_id        : { type: DataTypes.INTEGER, allowNull: true },
    topic_id             : { type: DataTypes.INTEGER, allowNull: true },
    // question_type        : { type: DataTypes.ENUM('SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'FILL_IN_THE_BLANKS', 'TRUE_FALSE', 'MATCH_THE_FOLLOWING'), allowNull: false },
    statement            : { type: DataTypes.TEXT, allowNull: false },
    hint                 : { type: DataTypes.TEXT, allowNull: true },
    // knowledge_level      : { type: DataTypes.ENUM('MUST_KNOW', 'SHOULD_KNOW', 'NICE_TO_KNOW'), allowNull: true, defaultValue: null },
    // proficiency_level    : { type: DataTypes.ENUM('A1', 'A2', 'B1', 'B2', 'C1', 'C2'), allowNull: true, defaultValue: null},
    s3url                : { type: DataTypes.TEXT, allowNull: true },
    mime_type            : { type: DataTypes.STRING, allowNull: true, defaultValue: null },
    correct_answer       : { type: DataTypes.STRING, allowNull: false },
    answer_explanation   : { type: DataTypes.TEXT, allowNull: false },
    // blooms_taxonomy      : { type: DataTypes.ENUM('REMEMBER', 'UNDERSTAND', 'APPLY', 'ANALYZE', 'EVALUTE', 'CREATE'), allowNull: true },
    // difficulty_level     : { type: DataTypes.ENUM('EASY', 'MEDIUM', 'HARD', 'VERY_HARD'), allowNull: true },
    // complexity_level     : { type: DataTypes.ENUM('P1', 'P2', 'P3', 'P4', 'P5'), allowNull: false, },
    estimated_time       : { type: DataTypes.INTEGER(11), allowNull: true, defaultValue: 0 },
    correct_answer_score : { type: DataTypes.FLOAT(5, 2), allowNull: true, defaultValue: 0 },
    answer               : { type: DataTypes.STRING, allowNull: true },
    tags                 : { type: DataTypes.TEXT, allowNull: true },
    deleted_at           : { type: DataTypes.DATE, allowNull: true, defaultValue: null }
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

  Model.associate = (models)=> {
    // Model.hasMany(models.question_options, {foreignKey: 'question_id'});
    // Model.belongsTo(models.strands, {foreignKey: 'strand_id'});
    // Model.belongsTo(models.topics, {foreignKey: 'topic_id'});
  };
  return Model;
};