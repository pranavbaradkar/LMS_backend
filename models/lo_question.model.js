'use strict';


module.exports = (sequelize, DataTypes) => {
  var Model = sequelize.define('lo_questions', {
    id                   : { type: DataTypes.INTEGER(11), autoIncrement: true, allowNull: false, primaryKey: true },
    level_id             : { type: DataTypes.INTEGER, allowNull: true },
    grade_id             : { type: DataTypes.INTEGER, allowNull: true },
    subject_id           : { type: DataTypes.INTEGER, allowNull: true },
    question_type        : { type: DataTypes.ENUM('SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'FILL_IN_THE_BLANKS', 'TRUE_FALSE', 'MATCH_THE_FOLLOWING'), allowNull: false },
    statement            : { type: DataTypes.TEXT, allowNull: false },
    s3url                : { type: DataTypes.TEXT, allowNull: true },
    mime_type            : { type: DataTypes.STRING, allowNull: true, defaultValue: null },
    correct_answer       : { type: DataTypes.STRING, allowNull: false },
    answer_explanation   : { type: DataTypes.TEXT, allowNull: false },
    blooms_taxonomy      : { type: DataTypes.ENUM('REMEMBER', 'UNDERSTAND', 'APPLY', 'ANALYZE', 'EVALUTE', 'CREATE'), allowNull: false, },
    difficulty_level     : { type: DataTypes.ENUM('EASY', 'MEDIUM', 'HARD', 'VERY_HARD'), allowNull: false, },
    complexity_level     : { type: DataTypes.ENUM('P1', 'P2', 'P3', 'P4', 'P5'), allowNull: false, },
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
    Model.hasMany(models.lo_question_options, {foreignKey: 'lo_question_id'});
    // Model.belongsTo(models.strands, {foreignKey: 'strand_id'});
    // Model.belongsTo(models.topics, {foreignKey: 'topic_id'});
  };
  return Model;
};