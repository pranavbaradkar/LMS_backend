const express 			= require('express');
const router 			= express.Router();

// controllers
const MetaController 	= require('../controllers/meta.controller');

//********* Meta Router **********
router.get('/:table', MetaController.getMeta);
router.get('/:table/:id', MetaController.getSingleMeta);

module.exports = router;
