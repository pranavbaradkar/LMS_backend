const express 			= require('express');
const router 			= express.Router();
var Passport = require('passport').Passport,
adminPassport = new Passport();
require("../middleware/admin-auth")(adminPassport);


// controllers
const MetaController 	= require('../controllers/meta.controller');

//********* Meta Router **********
router.get('/:table', MetaController.getMeta);
router.get('/:table/:id', MetaController.getSingleMeta);

module.exports = router;
