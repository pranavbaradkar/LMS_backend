'use strict';
const fs        = require('fs');
const path      = require('path');
const Sequelize = require('sequelize');
const basename  = path.basename(__filename);
const db        = {};
const { CONFIG } = require('../config/config');
const { snakeToCamel } = require('../services/util.service');

// console.log(CONFIG);

const sequelize = new Sequelize(CONFIG.db_name, CONFIG.db_user, CONFIG.db_password, {
  host: CONFIG.db_host,
  dialect: CONFIG.db_dialect,
  port: CONFIG.db_port,
  operatorsAliases: false,
  logging: false
});

fs.readdirSync(__dirname)
  .filter((file) => {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  })
  .forEach((file) => {
    let model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes)
    db[model.name] = model;
  });

db.custom_attributes = {};
Object.keys(db).forEach((modelName) => {
  db.custom_attributes[modelName] = {};
  db.custom_attributes[modelName].attributes = [];
  for(let key in db[modelName].rawAttributes ) {
    // console.log(db[modelName].rawAttributes[key]);
    db.custom_attributes[modelName].attributes.push([db[modelName].rawAttributes[key].fieldName, snakeToCamel(db[modelName].rawAttributes[key].fieldName)]);
    // console.log([db[modelName].rawAttributes[key].type.key, snakeToCamel(db[modelName].rawAttributes[key].type.key)]);
  }
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
