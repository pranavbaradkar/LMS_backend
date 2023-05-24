'use strict';


module.exports = (sequelize, DataTypes) => {
  var Model = sequelize.define('question_pools', {
    id                   : { type: DataTypes.INTEGER(11), autoIncrement: true, allowNull: false, primaryKey: true },
    user_id              : { type: DataTypes.INTEGER, allowNull: false },
    assessment_id        : { type: DataTypes.INTEGER, allowNull: false },
    assessment_type      : { type: DataTypes.ENUM('SCREENING', 'MAINS'), allowNull: false },
    question             : { type: DataTypes.TEXT, allowNull: false,
                            get() {
                              // Getter method to parse JSON data when accessing the column
                              const jsonData = this.getDataValue('question');
                              return jsonData ? JSON.parse(jsonData) : null;
                            },
                            set(value) {
                              // Setter method to stringify JSON data when setting the column
                              const jsonData = value ? JSON.stringify(value) : null;
                              this.setDataValue('question', jsonData);
                            },
                            },
    question_status      : { type: DataTypes.ENUM('COMPLETED', 'PENDING'), allowNull: true },
    deleted_at           : { type: DataTypes.DATE, allowNull: true, defaultValue: null }
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