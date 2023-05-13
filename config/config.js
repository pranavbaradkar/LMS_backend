require('dotenv').config();//instatiate environment variables

let CONFIG = {} //Make this global to use all over the application

CONFIG.app          = process.env.APP   || 'dev';
CONFIG.port         = process.env.PORT  || '3000';

CONFIG.db_dialect   = process.env.DB_DIALECT    || 'mysql';
CONFIG.db_host      = process.env.DB_HOST       || 'localhost';
CONFIG.db_port      = process.env.DB_PORT       || '3306';
CONFIG.db_name      = process.env.DB_NAME       || 'lms_backend';
CONFIG.db_user      = process.env.DB_USER       || 'root';
CONFIG.db_password  = process.env.DB_PASSWORD   || 'piyush@9796';

CONFIG.jwt_encryption  = process.env.JWT_ENCRYPTION || 'x24eF8a&8M=EsJvS';
CONFIG.jwt_expiration  = process.env.JWT_EXPIRATION || '10000000000';
CONFIG.jwt_admin_encryption = process.env.JWT_ADMIN_ENCRYPTION || 'f@9&3cKWGRE22A';
CONFIG.jwt_admin_expiration  = process.env.JWT_ADMIN_EXPIRATION || '10000000000';

module.exports.CONFIG = CONFIG;
module.exports.development = {
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
  dialect: process.env.DB_DIALECT,
  logging: true
};
