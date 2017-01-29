const express = require('express');
const router = express.Router();

/**
 * Controllers - route handlers
 */
const indexController = require('../controllers/index');
const loginController = require('../controllers/login');


/**
 * Home routes
 */
router.get('/', indexController.index);

/**
 * Login Routes
 */
router.post('/login', loginController.authenticate);

module.exports = router;