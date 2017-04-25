const express = require('express');
const router = express.Router();

/**
 * Controllers - route handlers
 */
const indexController = require('../controllers/index');
const loginController = require('../controllers/login');
const factorController = require('../controllers/factor');
const companyController = require('../controllers/company');
const savedSearchController = require('../controllers/saved_search');
const watchlistController = require('../controllers/watchlist');

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
router.post('/companies/request-more',companyController.requestMore);

/**
 * Save search Routes
 */
router.post('/saved-searches', savedSearchController.create);
router.get('/investors/:userId/saved-searches', savedSearchController.getAll);
router.delete('/saved-searches/:id', savedSearchController.remove);
router.put('/saved-searches', savedSearchController.edit);

/**
 * Watchlist Routes
 */
router.post('/investors/:investorId/watched-companies', watchlistController.add);
router.get('/investors/:investorId/watched-companies', watchlistController.getAll);
router.delete('/investors/watched-companies/:id', watchlistController.remove);

module.exports = router;