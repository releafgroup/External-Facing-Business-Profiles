/**
 * Module Dependencies
 */
const express = require('express');
const bodyParser = require('body-parser');
const chalk = require('chalk');
const cors = require('cors');
const jsendRepsonse = require('./helpers/jsend_response');
const app = express();
const config = require('./config/config');
const passport = require('passport')

const requestAuth = require('./helpers/request_auth');

/**
 * Access Control
 */
app.use(cors());

/**
 * Express configuration.
 */
app.set('port', process.env.PORT || 3000);
app.use(bodyParser.json());

/**
 * Configure MongoDB connection
 */
require('./config/db')();

app.use('/companies/?*', requestAuth);
app.use('/saved-search/?*', requestAuth);
app.use('/factors/?*', requestAuth);
app.use('/investors/?*', requestAuth);
app.use('/currencies/?*', requestAuth);

require('./config/passport');
app.use(passport.initialize());

/**
 * Load routes
 */
app.use('/', require('./config/routes'));




// Configure Passport

/**
 * Start Express server.
 */

app.listen(app.get('port'), () => {
    console.log('%s Express server listening on port %d in %s mode.', chalk.green('✓'), app.get('port'), app.get('env'));
});

module.exports = app;