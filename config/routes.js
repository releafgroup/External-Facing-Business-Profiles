const express = require('express');
const router = express.Router();
const requestAuth = require('../helpers/request_auth');

/**
 * Controllers - route handlers
 */
const indexController = require('../controllers/index');
const loginController = require('../controllers/login');
const factorController = require('../controllers/factor');
const companyController = require('../controllers/company');
const currencyController = require('../controllers/currency');
const savedSearchController = require('../controllers/saved_search');
const watchlistController = require('../controllers/watchlist');
const investorController = require('../controllers/investor');
const businessOwnerController = require('../controllers/authentication');

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
router.get('/factors/overview', factorController.factorAverage);

/**
 * Companies Routes
 */
router.get('/companies', companyController.getAll);
router.get('/companies/search', companyController.search);
router.get('/companies/:id', companyController.get);
router.post('/companies/request-more', companyController.requestMore);

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
router.delete('/investors/:investorId/watched-companies/:id', watchlistController.remove);

/**
 * Currency Routes
 */
router.get('/currencies/:from/:value', currencyController.convertMoney);

/**
 * Preferences Routes
 */
router.put('/investors/:investorId/preferences', investorController.savePreference);
router.get('/investors/:investorId/preferences', investorController.getPreference);


router.post('/businesses', businessOwnerController.register);
router.post('/businesses/sessions', businessOwnerController.login);
router.get('/businesses', requestAuth, businessOwnerController.findAll);
router.post('/businesses/:id/approval', requestAuth, businessOwnerController.approve);
module.exports = router;