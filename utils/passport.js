var LocalStrategy = require('passport-local').Strategy;
var passport = require('passport');
var User = require('../models/user');
var Admin = require('../models/admin');
var Company = require('../models/company');
var FacebookStrategy = require('./passport_facebook');
var AdminLoginStrategy = require('./passport_admin');
var companyPassport = require('./passport_company');
var userFunctions = require('../utils/user');
var constants = require('../libs/constants');

/**
 * Passport session setup
 * required for persistent login sessions
 * passport needs ability to serialize and unserialize users out of session
 *
 * References: http://stackoverflow.com/questions/27637609/understanding-passport-serialize-deserialize
 * Read to understand how sessions work with multiple types of Schemas
 */
passport.serializeUser(function (model, done) {
    var type = constants.USER_TYPE_VOLUNTEER;
    if (model instanceof Admin) {
        type = constants.USER_TYPE_ADMIN;
    } else if (model instanceof Company) {
        type = constants.USER_TYPE_BUSINESS;
    }
    done(null, {'id': model.id, 'type': type});
});

passport.deserializeUser(function (sessionInfo, done) {
    if (sessionInfo.type == constants.USER_TYPE_ADMIN) {
        Admin.findById(sessionInfo.id, function (err, admin) {
            done(err, admin);
        });
    } else if (sessionInfo.type == constants.USER_TYPE_BUSINESS) {
        Company.findById(sessionInfo.id, function (err, company) {
            done(err, company);
        });
    } else {
        User.findById(sessionInfo.id, function (err, user) {
            done(err, user);
        });
    }
});

/**
 * Local Login
 */
passport.use('local-login', new LocalStrategy({
    // by default, local strategy uses username and password, we will override with email
    usernameField: 'local.email',
    passwordField: 'local.password',
    passReqToCallback: true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
}, function (req, email, password, done) {
    // asynchronous
    process.nextTick(function () {
        User.findOne({'local.email': email}, '+local.password', function (err, user) {
            // if there are any errors, return the error
            if (err)
                return done(err);
            // if no user is found, return the message
            if (!user)
                return done({
                    message: 'No user found.',
                    status: 404
                }, false);
            if (!user.comparePassword(password))
                return done({
                    message: 'Oops! Wrong password.',
                    status: 400
                }, false);

            // all is well, return user
            return done(null, user);
        });
    });

}));

/**
 * Local Signup
 */
passport.use('local-signup', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField: 'local.email',
        passwordField: 'local.password',
        passReqToCallback: true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
    },
    function (req, email, password, done) {
        // asynchronous
        process.nextTick(function () {
            //  Whether we're signing up or connecting an account, we'll need
            //  to know if the email address is in use.
            User.findOne({'local.email': email}, function (err, existingUser) {

                // if there are any errors, return the error
                if (err)
                    return done({message: err.message, status: 500}, false);

                // check to see if there's already a user with that email
                if (existingUser) {
                    return done({message: 'user with that email already exists', status: 409}, false);
                }
                //  We're not logged in, so we're creating a brand new user.
                // create the user
                var newUser = new User();
                for (var a in req.body) {
                    if (a !== "local.password" && a !== "skills" && a !== "skill_ratings") {
                        newUser.setItem(a, req.body[a]);
                    } else if (a === "local.password") {
                        if (!newUser.validatePassword(req.body[a])) return done(null, false, {
                            success: false,
                            message: "password not valid"
                        });
                        newUser.setItem(a, newUser.generateHash(req.body[a]));
                    } else {
                        var arr = [];
                        for (var prop in req.body[a]) {
                            arr.push(req.body[a][prop]);
                        }
                        newUser.setItem(a, arr);
                    }
                }
                newUser.save(function (err) {
                    if (err) {
                        return done({message: err.message, status: 400, errors: err.errors}, false);
                    }

                    userFunctions.sendVerificationEmail(newUser);

                    if (!req.body.profile_photo_data && !(req.body.resume_data && req.body.resume_extension)) {
                        return done(null, newUser);
                    } else {
                        userFunctions.uploadMedia(req.body.profile_photo_data, 'profile_photos', 'jpg',
                            'profile_photo', newUser, function () {
                                if (req.body.resume_data && req.body.resume_extension) {
                                    userFunctions.uploadMedia(req.body.resume_data, 'resumes', req.body.resume_extension,
                                        'resume', newUser, function () {
                                            return done(null, newUser);
                                        });
                                } else {
                                    return done(null, newUser);
                                }
                            });
                    }
                });
            });
        });
    })
);

// Facebook login
passport.use('facebook', FacebookStrategy);

// Admin Login
passport.use('admin-login', AdminLoginStrategy);

// Company Signup
passport.use('company-signup', companyPassport.CompanySignupStrategy);

// Company Login
passport.use('company-login', companyPassport.CompanyLoginStrategy);
module.exports = passport;