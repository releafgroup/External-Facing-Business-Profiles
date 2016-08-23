var FacebookStrategy = require('passport-facebook').Strategy;
//var secret = require('../../secret').secret;
var User = require('../models/user');

var secret = {'facebook' : {'id' : 1, 'secret': 2}};


var HOST_DOMAIN = 'http://localhost:3000';

/**
 * FacebookStrategy to be used by passport during authentication.
 */
module.exports = new FacebookStrategy({
    clientID: secret.facebook.id,
    clientSecret: secret.facebook.secret,
    callbackURL: `${HOST_DOMAIN}/users/auth/facebook/login/callback`
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

            newUser.save(function(err) {
                if (err) { console.log(err); return done({success: false, message: err.message}); }
                return done(null, newUser);
            }); 
        });
    });
  }
);
