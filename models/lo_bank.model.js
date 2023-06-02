'use strict';
module.exports = (sequelize, DataTypes) => {
  var Model = sequelize.define('lo_banks', {
    id             : { type: DataTypes.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true },
    lo_text        : { type: DataTypes.STRING, allowNull: false },
    level_id       : { type: DataTypes.INTEGER, allowNull: true, defaultValue: null },
    grade_id       : { type: DataTypes.INTEGER, allowNull: true, defaultValue: null },
    subject_id     : { type: DataTypes.INTEGER, allowNull: true, defaultValue: null },
    // strand_id      : { type: DataTypes.INTEGER, allowNull: true, defaultValue: null },
    // sub_strand_id  : { type: DataTypes.INTEGER, allowNull: true, defaultValue: null },
    // topic_id       : { type: DataTypes.INTEGER, allowNull: true, defaultValue: null },
    skill_id       : { type: DataTypes.INTEGER, allowNull: true, defaultValue: null },
    deleted_at     : { type: DataTypes.DATE, allowNull: true, defaultValue: null }
  },{
    underscored: true,
    timestamps: true,
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at'
  });

  Model.associate = (models)=> {
    // Model.belongsTo(models.sub_strands, {foreignKey: 'sub_strand_id'});
    // Model.belongsTo(models.strands, {foreignKey: 'strand_id'});
    // Model.belongsTo(models.topics, {foreignKey: 'topic_id'});
  };
  return Model;
};