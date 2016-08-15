var LocalStrategy    = require('passport-local').Strategy;
var passport = require('passport');
// load up the user model
var User = require('../models/user');
var bcrypt = require('bcrypt');


// =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    passport.use('local-login', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
    },
    function(req, email, password, done) {
        // asynchronous
        process.nextTick(function() {
            User.findOne({ 'email' :  email }, function(err, user) {
                // if there are any errors, return the error
                if (err)
                    return done(err);

                // if no user is found, return the message
                if (!user)
                    return done(null, false, {message: 'No user found.'});
                //if (!user.comparePassword(password))
                //    return done(null, false, {message: 'Oops! Wrong password.'});

                // all is well, return user
                    return done(null, user);
            });
        });

    }));

    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    passport.use('local-signup', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
    },
    function(req, email, password, done) {
        // asynchronous
        process.nextTick(function() {

            //  Whether we're signing up or connecting an account, we'll need
            //  to know if the email address is in use.
            User.findOne({'email': email}, function(err, existingUser) {

                // if there are any errors, return the error
                if (err)
                    return done(null, false, {message: err.message});

                // check to see if there's already a user with that email
                if (existingUser) {
                    return done(null, false, {message: 'user with that email already exists'});

                } 
                //  We're not logged in, so we're creating a brand new user.
                    // create the user
                    var newUser = new User();
                    for( a in req.body){
                        if(a!= "password"){
                            newUser[a]  = req.body[a];   
                        } else {
                           if (req.body.password.length < 8 || req.body.password.length > 64) {
                                return res.json({success: false, message: "Password not valid"}); // TODO: move to user.js
                           }
                           newUser[a] = newUser.generateHash(req.body[a]);                 
                        }
                    }
                    newUser.save(function(err) {
                        if (err) {
                            return done(null, false, {message: err.message});
                        }
                        return done(null, newUser);
                    });

            });
        });

    }));


module.exports = passport;
