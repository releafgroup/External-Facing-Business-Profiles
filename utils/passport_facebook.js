var FacebookStrategy = require('passport-facebook').Strategy;
var secret = require('../secret');
var User = require('../models/user');
var path = require('path');
var HOST_DOMAIN = process.env.HOST_DOMAIN || 'http://localhost:3000' ;

var fbInfo = process.env.NODE_ENV === 'production' ? secret.facebook.production : secret.facebook.dev;

/**
 * FacebookStrategy to be used by passport during authentication.
 */
module.exports = new FacebookStrategy({
    clientID: fbInfo.id,
    clientSecret: fbInfo.secret,
    callbackURL: HOST_DOMAIN + '/users/auth/facebook/login/callback'
  },
  function(accessToken, refreshToken, profile, done) {
    process.nextTick(function() {

        User.findOne({ 'facebook.id': profile.id }, function(err, user) {
            if (err) return done({ success: false, message: err.message });
            if (user) return done(null, user);

            var newUser = new User({

                facebook: {
                    id: profile.id,
                    token: accessToken,
                    first_name: profile.name.givenName,
                    last_name: profile.name.familyName
                },

                signupType: 'facebook' // allows db to save user even though some fields are missing
            });

            newUser.email_verified = true;
            newUser.save(function(err) {
                if (err) { return done({success: false, message: err.message}); }
                return done(null, newUser);
            });
        });
    });
  }
);
