const express = require('express');
const router = express.Router();

/**
 * Controllers - route handlers
 */
const indexController = require('../controllers/index');
const loginController = require('../controllers/login');
const factorController = require('../controllers/factor');
const companyController = require('../controllers/company');
const savedController = require('../controllers/saved_search');

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

/**
 * Factors Routes
 */
router.get('/factors/:factor/queries', factorController.getFactorQueries);
router.get('/factors/queries/:id', factorController.getFactorQuery);
router.post('/factors/queries/:id/email/send', factorController.sendQueryEmail);
router.get('/factors/overview', factorController.rFactor);

/**
 * Companies Routes
 */
router.get('/companies', companyController.getAll);
router.get('/companies/search', companyController.search);
router.get('/companies/:id', companyController.get);

/**
 * Save search Routes
 */

 router.post('/search/save',savedController.create);
 router.get('/search/save',savedController.getAll);
 router.post('/search/save/delete', savedController.remove);
 router.post('/search/save/edit', savedController.edit);





module.exports = router;