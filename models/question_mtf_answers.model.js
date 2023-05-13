'use strict';


module.exports = (sequelize, DataTypes) => {
  var Model = sequelize.define('question_mtf_answers', {
    id             : { type: DataTypes.INTEGER(11), autoIncrement: true, allowNull: false, primaryKey: true },
    question_id    : { type: DataTypes.INTEGER(11), allowNull: false },
    answer_key     : { type: DataTypes.TEXT, allowNull: false, },
    answer_value   : { type: DataTypes.TEXT, allowNull: false },
    answer_type    : { type: DataTypes.ENUM('IMAGE', 'TEXT', 'SEQUENCE', 'AUDIO', 'VIDEO'), defaultValue: 'TEXT' },
    answer_uuid    : { type: DataTypes.BOOLEAN, allowNull: true, defaultValue: null },
    deleted_at     : { type: DataTypes.DATE, allowNull: true, defaultValue: null }
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