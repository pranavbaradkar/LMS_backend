'use strict';


module.exports = (sequelize, DataTypes) => {
  var Model = sequelize.define('question_options', {
    id             : { type: DataTypes.INTEGER(11), autoIncrement: true, allowNull: false, primaryKey: true },
    question_id    : { type: DataTypes.INTEGER(11), allowNull: false },
    option_key     : { type: DataTypes.TEXT, allowNull: false, },
    option_value   : { type: DataTypes.TEXT, allowNull: false },
    option_type    : { type: DataTypes.ENUM('IMAGE', 'TEXT', 'SEQUENCE', 'AUDIO', 'VIDEO'), defaultValue: 'TEXT', },
    is_correct     : { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    correct_answer : { type: DataTypes.TEXT, allowNull: true },
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