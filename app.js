/**
 * Module Dependencies
 */
const express = require('express');
const bodyParser = require('body-parser');
const chalk = require('chalk');

const app = express();

/**
 * Express configuration.
 */
app.set('port', process.env.PORT || 3000);
app.use(bodyParser.json());

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