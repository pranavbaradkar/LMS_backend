'use strict';


module.exports = (sequelize, DataTypes) => {
  var Model = sequelize.define('professional_infos', {
    id               : { type: DataTypes.INTEGER(11), autoIncrement: true, allowNull: false, primaryKey: true },
    user_id          : { type: DataTypes.INTEGER(11), allowNull: false },
    experience_year  : { type: DataTypes.INTEGER(11), allowNull: false },
    experience_month : { type: DataTypes.INTEGER(11), allowNull: false },
    position         : { type: DataTypes.STRING, allowNull: false },
    employee_type_id : { type: DataTypes.INTEGER(11), allowNull: true },
    board_id         : { type: DataTypes.INTEGER(11), allowNull: true },
    level_ids        : { type: DataTypes.STRING, allowNull: true },
    grade_ids        : { type: DataTypes.STRING, allowNull: true },
    subject_ids      : { type: DataTypes.STRING, allowNull: true },
    school_id        : { type: DataTypes.INTEGER, allowNull: true },
    other_name       : { type: DataTypes.STRING, allowNull: true },
    country_id       : { type: DataTypes.INTEGER, allowNull: true },
    state_id         : { type: DataTypes.INTEGER, allowNull: true },
    city_id          : { type: DataTypes.INTEGER, allowNull: true },
    district_id      : { type: DataTypes.INTEGER, allowNull: true },
    taluka_id        : { type: DataTypes.INTEGER, allowNull: true },
    address          : { type: DataTypes.STRING, allowNull: true },
    is_role          : { type: DataTypes.BOOLEAN, defaultValue: false },
    start_date       : { type: DataTypes.DATE, allowNull: true, defaultValue: null },
    end_date         : { type: DataTypes.DATE, allowNull: true, defaultValue: null },
    deleted_at       : { type: DataTypes.DATE, allowNull: true, defaultValue: null }
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