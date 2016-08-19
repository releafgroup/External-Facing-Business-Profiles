var FacebookStrategy = require('passport-facebook').Strategy;
var passport = require('passport');
var secret = require('../../secret').secret;
var User = require('../models/user');
var router = require('express').Router();

var HOST_DOMAIN = 'http://localhost:3000';

passport.use(new FacebookStrategy({
    clientID: secret.facebook.id,
    clientSecret: secret.facebook.secret,
    callbackURL: `${HOST_DOMAIN}/auth/facebook/callback`
  },
  function(accessToken, refreshToken, profile, done) {
    process.nextTick(function() {
        User.findOne({ 'facebook.id': profile.id }, function(err, user) {
            if (err) return done({ success: false, message: err.message });
            if (user) return done(null, { success: true, message: user });
            // no user, create a new one
            var newUser = new User();
            newUser.facebook.id = profile.id;
            newUser.facebook.token = accessToken;
            newUser.facebook.first_name = profile.name.givenName
            newUser.facebook.last_name = profile.name.familyName;
            newUser.facebook.email = profile.emails[0].value;

            newUser.save(function(err) {
                if (err) throw err;
                return done(null, { success: true, message: newUser });
            });
        });
    });
  }
));

router.get('/',
    passport.authenticate(
        'facebook', 
        { scope: ['read_stream', 'publish_actions', 'email'] }
    )
);

router.get('/callback', 
    passport.authenticate(
        'facebook',
        { 
            successRedirect: '/',
            failureRedirect: '/login' 
        }
    )
);