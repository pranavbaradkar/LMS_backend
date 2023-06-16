'use strict';


module.exports = (sequelize, DataTypes) => {
  var Model = sequelize.define('psy_question_options', {
    id              : { type: DataTypes.INTEGER(11), autoIncrement: true, allowNull: false, primaryKey: true },
    psy_question_id : { type: DataTypes.INTEGER(11), allowNull: false },
    option_key      : { type: DataTypes.TEXT, allowNull: false, },
    option_value    : { type: DataTypes.TEXT, allowNull: false },
    option_type     : { type: DataTypes.ENUM('IMAGE', 'TEXT', 'SEQUENCE', 'AUDIO', 'VIDEO'), defaultValue: 'TEXT', },
    score_value     : { type: DataTypes.TEXT, allowNull: false },
    deleted_at      : { type: DataTypes.DATE, allowNull: true, defaultValue: null }
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
    Model.belongsTo(models.psy_questions, {foreignKey: 'psy_question_id'});
    // Model.belongsTo(models.strands, {foreignKey: 'strand_id'});
    // Model.belongsTo(models.topics, {foreignKey: 'topic_id'});
  };

  return Model;
};