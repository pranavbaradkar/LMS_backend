'use strict';
module.exports = (sequelize, DataTypes) => {
  var Model = sequelize.define('demovideo_details', {
    id               : { type: DataTypes.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true },
    user_id          : { type: DataTypes.INTEGER, allowNull: false },
    assessment_id    : { type: DataTypes.INTEGER, allowNull: false },
    video_link       : { type: DataTypes.STRING, allowNull: true },
    scores           : { type: DataTypes.STRING, allowNull: false, 
                        get: function() {  
                        let value = this.getDataValue('scores');
                        return JSON.parse(value);
                        },
                        set: function(val) {
                        this.setDataValue('scores', JSON.stringify(val));
                        }
                      },
    demo_topic       : { type: DataTypes.STRING, allowNull: false },
    demo_description : { type: DataTypes.TEXT, allowNull: true },
    status           : { type: DataTypes.ENUM('PENDING','NOT_RECOMMENDED', 'RECOMMENDED'), allowNull: false, defaultValue: 'PENDING' },
    deleted_at       : { type: DataTypes.DATE, allowNull: true, defaultValue: null }
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