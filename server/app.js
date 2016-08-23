var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var config = require('./config.js');                                                                   
var mongoose = require('mongoose');                                                                    
var superSecret = config.superSecret;                                                                  
var authfunc = require('./utils/authfunc.js');
var io = require('socket.io')();
var session = require('express-session');
var MongoStore = require('express-session-mongo');

var app = express();

mongoose.Promise = global.Promise;
if (app.get('env') == 'mocha_db') { // TODO: abstract away better/clean up code quality
    mongoose.connect(config.mocha_database);
} else {
    mongoose.connect(config.database);   
}

// setup email verification
var verifyEmail = require('./utils/email')(require('email-verification')(mongoose));
var user_passport = require('./utils/passport_user.js')(verifyEmail);

app.use(logger('dev'));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// TODO: maybe switch to cors plugin
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3001'); //TODO: add in FE

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});


app.use(session({ secret: 'releaf4lyfe',  store: new MongoStore() })); // session secret
app.use(user_passport.initialize());
app.use(user_passport.session()); // persistent login sessions
app.set('io', io);



//mongoose.connection.db.sessions.ensureIndex( { "lastAccess": 1 }, { expireAfterSeconds: 3600 } )

// import routes
var routes = require('./routes/index');
var users = require('./routes/users')(user_passport);
var companies = require('./routes/companies');
var admin = require('./routes/admin');
var projects = require('./routes/projects');
var messenger = require('./routes/messenger')(app.get('io'));
app.use('/users', (req, res, next) => {req.actionType = req.body.actionType; req.body = req.body.user; next();});
app.use('/', routes);                                                                                  
app.use('/users', users); 
app.use('/companies', companies);
app.use('/admin', admin);
app.use('/projects', projects);
app.use('/messenger', messenger);
app.use(authfunc);




// view engine setup

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

/**
 * Development Settings
 */
if (app.get('env') === 'development') {
    // This will change in production since we'll be using the dist folder
    app.use(express.static(path.join(__dirname, '../client')));
    // This covers serving up the index page
    app.use(express.static(path.join(__dirname, '../client/.tmp')));
    app.use(express.static(path.join(__dirname, '../client/app')));

    // Error Handling
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

/**
 * Production Settings
 */
if (app.get('env') === 'production') {

    // changes it to use the optimized version for production
    app.use(express.static(path.join(__dirname, '/dist')));

    // production error handler
    // no stacktraces leaked to user
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: {}
        });
    });
}



module.exports = app;
