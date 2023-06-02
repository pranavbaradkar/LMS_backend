'use strict';
module.exports = (sequelize, DataTypes) => {
  var Model = sequelize.define('sub_strands', {
    id             : { type: DataTypes.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true },
    sub_strand_text: { type: DataTypes.STRING, allowNull: false },
    strand_id      : { type: DataTypes.INTEGER, allowNull: true, defaultValue: null },
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
    Model.belongsTo(models.strands, {foreignKey:'strand_id'});
    // Model.belongsToMany(models.lo ,{
    //   // as: 'lo_grades',
    //   through: 'lo_topics',
    //   foreignKey: 'lo_id',
    //   // otherKey: 'lo_bank_id',
    // });
  };
  return Model;
};