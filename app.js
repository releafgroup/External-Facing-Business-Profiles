var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var config = require('./config.js');
var mongoose = require('mongoose');
var authfunc = require('./utils/authentication');
var io = require('socket.io')();
var passport = require('./utils/passport');
var session = require('express-session');
var dummyData = require('./helpers/dummy_data');

// Loads the environment variables from the dotenv file
require('dotenv').config();

var MongoStore = require('connect-mongo')(session);

var app = express();
app.use(logger('dev'));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

//TODO: Front end to have a form tag, with its action pointed to the express route.

var domain_allowed = 'https://releaf-frontend-app.herokuapp.com';
if (app.get('env') == 'mocha_db' || app.get('env') == 'development') {
    domain_allowed = 'http://localhost:3001';
}

// TODO: maybe switch to cors plugin
app.use(function (req, res, next) {
    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', domain_allowed); //TODO: add in FE

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

// Ensures that responses are not cached
app.use(require('./middlewares/no_cache'));

mongoose.Promise = global.Promise;
if (app.get('env') == 'mocha_db') { // TODO: abstract away better/clean up code quality
    mongoose.connect(config.mocha_database);
} else {
    mongoose.connect(config.database);
}

// session secret
app.use(session({secret: 'releaf4lyfe', store: new MongoStore({mongooseConnection: mongoose.connection})}));

app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.set('io', io);

// import routes
var routes = require('./routes/index');
var users = require('./routes/users')(passport);
var companies = require('./routes/companies')(passport);
var admin = require('./routes/admin')(passport);
var projects = require('./routes/projects');
var messenger = require('./routes/messenger')(app.get('io'));
app.use('/', routes);
app.use('/users', users);
app.use('/companies', companies);
app.use('/admin', admin);
app.use('/projects', projects);
app.use('/messenger', messenger);
app.use(authfunc);

// Adds dummy projects
dummyData.addDummyProjects();

// Error Handling
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.json({
        message: err.message,
        success: false,
        errors: err.errors
    });
});

module.exports = app;
