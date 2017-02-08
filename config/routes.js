const express = require('express');
const router = express.Router();

/**
 * Controllers - route handlers
 */
const indexController = require('../controllers/index');
const loginController = require('../controllers/login');
const factorController = require('../controllers/factor');


/**
 * Home routes
 */
router.get('/', indexController.index);

/**
 * Login Routes
 */
router.post('/login', loginController.authenticate);

/**
 * Sub Factors Routes
 */
router.get('/factors', factorController.getAll);

module.exports = router;