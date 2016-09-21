var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var config = require('./config.js');
var mongoose = require('mongoose');
var superSecret = config.superSecret;
var authfunc = require('./utils/authentication.js');
var io = require('socket.io')();
var user_passport = require('./utils/passport_user.js');
var session = require('express-session');
var multer = require('multer');
var upload = multer({dest: './users/upload'});//catch all multipart data, fileuploads automatically and stores the file to ‘upload/’ folder.
var dummyData = require('./helpers/dummy_data');

var MongoStore = require('connect-mongo')(session);

var app = express();
app.use(logger('dev'));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

//TODO: Front end to have a form tag, with its action pointed to the express route.
//Fileupload handling will be taken care automatically and all file moved to ‘upload’ folder.

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


mongoose.Promise = global.Promise;
if (app.get('env') == 'mocha_db') { // TODO: abstract away better/clean up code quality
    mongoose.connect(config.mocha_database);
} else {
    mongoose.connect(config.database);
}

app.use(session({secret: 'releaf4lyfe', store: new MongoStore({mongooseConnection: mongoose.connection})})); // session secret

app.use(user_passport.initialize());
app.use(user_passport.session()); // persistent login sessions
app.set('io', io);

// import routes
var routes = require('./routes/index');
var users = require('./routes/users')(user_passport);
var companies = require('./routes/companies');
var admin = require('./routes/admin')(user_passport);
var projects = require('./routes/projects');
var messenger = require('./routes/messenger')(app.get('io'));
var upload = require('./routes/upload');
app.use('/', routes);
app.use('/users', users);
app.use('/companies', companies);
app.use('/admin', admin);
app.use('/projects', projects);
app.use('/messenger', messenger);
app.use('/upload', upload);
app.use(authfunc);

// Adds dummy projects
dummyData.addDummyProjects();

// Error Handling
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    return res.json({
        message: err.message,
        success: false,
        errors: err.errors
    });
});

/**
 * Development Settings
 */
if (app.get('env') === 'development' || app.get('env') == 'mocha_db') {
    // This will change in production since we'll be using the dist folder
    app.use(express.static(path.join(__dirname, '../client')));
    // This covers serving up the index page
    app.use(express.static(path.join(__dirname, '../client/.tmp')));
    app.use(express.static(path.join(__dirname, '../client/app')));
}

/**
 * Production Settings
 */
if (app.get('env') === 'production') {
    // changes it to use the optimized version for production
    app.use(express.static(path.join(__dirname, '/dist')));
}

module.exports = app;
