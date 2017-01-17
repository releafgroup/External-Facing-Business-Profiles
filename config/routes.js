const express = require('express');
const router = express.Router();

/**
 * Controllers - route handlers
 */
const indexController = require('../controllers/index');


/**
 * Home routes
 */
router.get('/', indexController.index);


module.exports = router;