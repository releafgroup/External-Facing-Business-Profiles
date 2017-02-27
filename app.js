/**
 * Module Dependencies
 */
const express = require('express');
const bodyParser = require('body-parser');
const chalk     = require('chalk');
const cors      = require('cors');
const jwt       = require('jsonwebtoken');
const jsendRepsonse = require('./helpers/jsend_response');
const app = express();
const config = require('./config/config');
/**
 * Access Control
 */
app.use(cors());

/**
 * Express configuration.
 */
app.set('port', process.env.PORT || 3000);
app.use(bodyParser.json());

app.use('/companies/?*',function(req,res,next){
    var token = req.body.token || req.query.token || req.headers['x-access-token'];
    var isAdmin = function() {
        return (config.ADMIN_SECRET_KEY == token);
    };

    if(isAdmin()){
        next();
        return;
    }
    // decode token
    if (token) {
        // verifies secret and checks exp
        jwt.verify(token, config.SECRET, function (err, decoded) {
            if (err) {
                return res.json({success: false, message: 'Failed to authenticate token.'});
            } else {
                if(req.method != 'GET'){
                    return jsendRepsonse.sendError("sorry you are not authorized to perform this operation",
                        400, res)
                }
                next();
            }
        });
    } else {
        return jsendRepsonse.sendError("sorry please you don't have access", 400, res);
    }
});

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