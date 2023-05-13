"use strict";
module.exports = (sequelize, DataTypes) => {
  var Model = sequelize.define("user_teaching_interests", {
    id            : { type: DataTypes.INTEGER(11), autoIncrement: true, allowNull: false, primaryKey: true },
    user_id   : { type: DataTypes.INTEGER, allowNull: false },
    level_ids : { 
      type: DataTypes.JSONB, 
      allowNull:true,
      defaultValue: null
    },
    school_ids : { 
      type: DataTypes.JSONB, 
      allowNull:true,
      defaultValue: null
    },
    board_ids : { 
      type: DataTypes.JSONB, 
      allowNull:true,
      defaultValue: null
    },
    subject_ids : { 
      type: DataTypes.JSONB, 
      allowNull:true,
      defaultValue: null
    }
  },
    {
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
