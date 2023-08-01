'use strict';


module.exports = (sequelize, DataTypes) => {
  var Model = sequelize.define('assessment_questions', {
    id            : { type: DataTypes.INTEGER(11), allowNull: false, autoIncrement: true, primaryKey: true },
    assessment_id : { type: DataTypes.INTEGER, allowNull: false },
    question_id   : { type: DataTypes.INTEGER, allowNull: false,
                      references: {
                        model: 'psy_questions', // Name of the referenced table
                        key: 'psy_question_id', // Primary key of the referenced table
                      }},
    type          : { type: DataTypes.ENUM('SCREENING', 'MAINS'), defaultValue : 'SCREENING', allowNull: true },
    score         : { type: DataTypes.FLOAT, defaultValue : 0 },
    deleted_at    : { type: DataTypes.DATE, allowNull: true, defaultValue: null }
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
  return Model;
};