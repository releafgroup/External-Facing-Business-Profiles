var FacebookStrategy = require('passport-facebook').Strategy;
var passport = require('passport');
var secret = require('../../secret').secret;
var User = require('../models/user');
// var router = require('express').Router();

var HOST_DOMAIN = 'http://localhost:3000';

module.exports = new FacebookStrategy({
    clientID: secret.facebook.id,
    clientSecret: secret.facebook.secret,
    callbackURL: `${HOST_DOMAIN}/users/auth/facebook/login/callback`
  },
  function(accessToken, refreshToken, profile, done) {
    process.nextTick(function() {
        User.findOne({ 'facebook.id': profile.id }, function(err, user) {
            if (err) return done({ success: false, message: err.message });
            if (user) return done(null, { success: true, message: user });
            // no user, create a new one
            // console.log(profile);
            // var newUser = new User({});
            // newUser.facebook.id = profile.id;
            // newUser.facebook.token = accessToken;
            // newUser.facebook.first_name = profile.name.givenName
            // newUser.facebook.last_name = profile.name.familyName;
            // newUser.facebook.email = profile.emails[0].value;
            // return done('matiki wo'); 
            var newUser = new User({
                local: {
                    password : 'aaaaaaaaaaaaa',
                    first_name : 'aaaaaaaaaaaaa',
                    last_name : 'aaaaaaaaaaaaa',
                    email : 'madagascar@gmail.com'
                },
                facebook: {
                    id: profile.id,
                    token: accessToken,
                    first_name: profile.name.givenName,
                    last_name: profile.name.familyName
                },
                "primary_institution": "stanny",
                "secondary_institution": "odododdo",
                "skills" : ["s", "f", "o"],
                "skill_ratings" : [2, 4, 3],
                "gender": "Female",
                "dob": "2016-06-07"
            });
            newUser.save(function(err) {
                if (err) throw err;
                return done(null, { success: true, message: newUser });
            }); 
        });
    });
  }
);
