var LocalStrategy = require('passport-local').Strategy;
var Admin = require('../models/admin');
var bcrypt = require('bcryptjs');

module.exports = new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'name',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass in the req from our route (lets us check if a admin is logged in or not)
    }, function(req, name, password, done) {
        // asynchronous
        process.nextTick(function() {
            Admin.findOne({ 'name' :  name }, function(err, admin) {
                // if there are any errors, return the error
                if (err)
                    return done(err);
                // if no user is found, return the message
                if (!admin)
                    return done(null, false, {message: 'No user found.'});
                if (!admin.comparePassword(password))
                    return done(null, false, {message: 'Oops! Wrong password.'});

                // all is well, return admin
                    return done(null, admin);
            });
        });
    }
);
