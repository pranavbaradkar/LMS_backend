'use strict';


module.exports = (sequelize, DataTypes) => {
  var Model = sequelize.define('user_assessments', {
    id                        : { type: DataTypes.INTEGER(11), allowNull: false, autoIncrement: true, primaryKey: true },
    user_id                   : { type: DataTypes.INTEGER, allowNull: false, },
    assessment_id             : { type: DataTypes.INTEGER, allowNull: false, },
    screening_status          : { type: DataTypes.ENUM('STARTED', 'INPROGRESS', 'FINISHED', 'PASSED', 'FAILED', 'ABORTED'), defaultValue: 'STARTED', },
    mains_status              : { type: DataTypes.ENUM('PENDING', 'STARTED', 'INPROGRESS', 'FINISHED', 'PASSED', 'FAILED', 'ABORTED'), defaultValue: 'PENDING' },
    screening_result_notified : { type: DataTypes.BOOLEAN, defaultValue: false, },
    mains_result_notified     : { type: DataTypes.BOOLEAN, defaultValue: false },
    deleted_at                : { type: DataTypes.DATE, allowNull: true, defaultValue: null }
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