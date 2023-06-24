const express 		= require('express');
const logger 	    = require('morgan');
const bodyParser 	= require('body-parser');
const passport      = require('passport');
const pe            = require('parse-error');
const cors          = require('cors');
const v1    = require('./routes/v1');
const app   = express();
const { CONFIG } = require('./config/config');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./public/v1/documentation/api.json');
const fs = require('fs');
const path = require('path')
require('dd-trace').init({ express })

app.use(logger('dev'));
app.use(bodyParser.json({limit:'50mb'}));

app.use(bodyParser.urlencoded({limit: '50mb', extended: false }));
// app.use(cookieParser());
// app.use(express.static(path.join(__dirname, 'public')));

//Passport
app.use(passport.initialize());

//Log Env
console.log("Environment:", CONFIG.app)
//DATABASE
const models = require("./models");
models.sequelize.authenticate().then(() => {
    console.log('Connected to SQL database:', CONFIG.db_name);
})
.catch(err => {
    console.error('Unable to connect to SQL database:',CONFIG.db_name, err);
});
if(CONFIG.app === 'dev'){
    // models.sequelize.sync();//creates table if they do not already exist
    // models.sequelize.sync({ force: true });//deletes all tables then recreates them useful for testing and development purposes
}
// CORS
app.use(cors());
app.use(function(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});
app.set('view engine', 'ejs');
app.use('/api/v1', v1);

const jsonsInDir = fs.readdirSync('./public/v1/documentation/json').filter(file => path.extname(file) === '.json');

jsonsInDir.forEach(file => {
  const fileData = fs.readFileSync(path.join('./public/v1/documentation/json', file));
  const json = JSON.parse(fileData.toString());
  swaggerDocument.paths = {...swaggerDocument.paths, ...json};
});
swaggerDocument.host = process.env.BASE_URL;
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument)); 

app.use('/', function(req, res){
	res.statusCode = 422;//send the appropriate status code
	res.json({status:"failed", message:"Something went wrong", data:{}})
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

//This is here to handle all the uncaught promise rejections
process.on('unhandledRejection', error => {
    console.error('Uncaught Error', pe(error));
});