const express = require('express');
const router = express.Router();

/**
 * Controllers - route handlers
 */
const indexController = require('../controllers/index');
const loginController = require('../controllers/login');
const factorController = require('../controllers/factor');
const companyController = require('../controllers/company');


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
router.get('/rfactors', factorController.rFactor);
/**
 * Factors Routes
 */
router.get('/factors/:factor/queries', factorController.getFactorQueries);
router.get('/factors/queries/:id', factorController.getFactorQuery);
router.post('/factors/queries/:id/email/send', factorController.sendQueryEmail);

/**
 * Companies Routes
 */
router.get('/companies', companyController.getAll);
router.get('/companies/search', companyController.search);
router.get('/companies/:id', companyController.get);

module.exports = router;