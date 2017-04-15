/**
 * Module Dependencies
 */
const express = require('express');
const bodyParser = require('body-parser');
const chalk     = require('chalk');
const cors      = require('cors');
const jsendRepsonse = require('./helpers/jsend_response');
const app = express();
const config = require('./config/config');

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

app.use('/companies/?*',requestAuth);
app.use('/saved-search/?*', requestAuth);


/**
 * Load routes
 */
app.use('/', require('./config/routes'));


/**
 * Configure MongoDB connection
 */
require('./config/db')();

/**
 * Start Express server.
 */

app.listen(app.get('port'), () => {
    console.log('%s Express server listening on port %d in %s mode.', chalk.green('✓'), app.get('port'), app.get('env'));
});

module.exports = app;