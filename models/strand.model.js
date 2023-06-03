'use strict';
module.exports = (sequelize, DataTypes) => {
  var Model = sequelize.define('strands', {
    id             : { type: DataTypes.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true },
    strand_text    : { type: DataTypes.STRING, allowNull: false },
    level_id       : { type: DataTypes.INTEGER, allowNull: true, defaultValue: null },
    grade_id       : { type: DataTypes.INTEGER, allowNull: true, defaultValue: null },
    subject_id     : { type: DataTypes.INTEGER, allowNull: true, defaultValue: null },
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
  };
  return Model;
};