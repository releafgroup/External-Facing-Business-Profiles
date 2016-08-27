var LocalStrategy    = require('passport-local').Strategy;

// load up the user model
var User = require('../models/user');
var bcrypt = require('bcryptjs');
var FacebookStrategy = require('./passport_fb');

module.exports = function(emailVerification) {
    emailVerification.insertTempUser = function(password, tempUserData, callback) {
        // password may or may not be hashed
        tempUserData[options.passwordFieldName] = password;
        var newTempUser = new options.tempUserModel();
        Object.keys(tempUserData).forEach(key => {
            newTempUser[key] = tempUserData[key];
        })
        console.log(newTempUser);
        newTempUser.save(function(err, tempUser) {
        if (err) {
            return callback(err, null, null);
        }
        return callback(null, null, tempUser);
        });
    };
    // emailVerification.generateTempUserModel = generateTempUserModel;
    var passport = require('passport');
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
        usernameField : 'local.email',
        passwordField : 'local.password',
        passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
    }, function(req, email, password, done) {
        // asynchronous
        process.nextTick(function() {
            User.findOne({ 'local.email' :  email }, function(err, user) {
                // if there are any errors, return the error
                if (err)
                    return done(err);
                // if no user is found, return the message
                if (!user)
                    return done(null, false, {message: 'No user found.'});
                if (!user.comparePassword(password))
                    return done(null, false, {message: 'Oops! Wrong password.'});

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
        usernameField : 'local.email',
        passwordField : 'local.password',
        passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
    },
    function(req, email, password, done) {

            if (req.actionType === 'register') { //if type is not 'register', will resend verification email
                // Create new user but don't save yet
                var newUser = new User();
                for ( a in req.body ) {
                    if(a !== "local.password" && a !== "skills" && a !== "skill_ratings") {
                        newUser.setItem(a, req.body[a]);
                    } else if (a === "local.password") {
                        if (req.body[a].length < 8 || req.body[a].length > 64) {
                            return done(null, false, {message: "Password not valid"});
                            // return res.json({success: false, message: "Password not valid"}); // TODO: move to user.js
                        }
                        newUser.setItem(a, newUser.generateHash(req.body[a]));
                    } else {
                        var arr = [];
                        for (var prop in req.body[a]) {
                            arr.push(req.body[a][prop]);
                        }
                        newUser.setItem(a, arr);
                    }
                }
                // console.log(newUser);
                emailVerification.createTempUser(newUser, function(err, existingPersistentUser, newTempUser) {
                    // console.log(newUser.local);
                    // newTempUser.local = newUser.local;
                    // newTempUser.save((err, newt) => console.log(newt));

                    if (err) {
                        return done(null, false, {message: 'ERROR: creating temporary user FAILED'});
                        // return res.status(404).send('ERROR: creating temporary user FAILED');
                    }

                    // user already exists in persistent collection
                    if (existingPersistentUser) {
                        return done(null, false, {message: 'You have already signed up and confirmed your account. Did you forget your password?'});
                    }

                    // new user created
                    if (newTempUser) {
                        var URL = newTempUser[emailVerification.options.URLFieldName];
                        // console.log(newTempUser);
                        // emailVerification.sendVerificationEmail(email, URL, function(err, info) {
                        //     if (err) {
                        //         console.log(err);
                        //         return done(null, false, {message: 'ERROR: sending verification email FAILED'});
                        //         // return res.status(404).send('ERROR: sending verification email FAILED');
                        //     }
                        //     return done(null, false, {message: 'An email has been sent to you. Please check it to verify your account.'});
                        // });
                        return done(null, false, {message: 'Wait a bit'});
                    // user already exists in temporary collection!
                    } else {
                        return done(null, false, {message: 'You have already signed up. Please check your email to verify your account.'});
                    }
                });

            // resend verification button was clicked (use actionType: resend)
            } else {
                emailVerification.resendVerificationEmail(email, function(err, userFound) {
                    if (err) {
                        return done(null, false, {message: 'ERROR: resending verification email FAILED'});
                        // return res.status(404).send('ERROR: resending verification email FAILED');
                    }
                    if (userFound) {
                        return done(null, false, {message: 'An email has been sent to you, yet again. Please check it to verify your account.'});
                        // res.json({
                        //     msg: 'An email has been sent to you, yet again. Please check it to verify your account.'
                        // });
                    } else {
                        return done(null, false, {message: 'Your verification code has expired. Please sign up again.'});
                        // res.json({
                        //     msg: 'Your verification code has expired. Please sign up again.'
                        // });
                    }
                });
            }
        // });

    }));

    // Facebook login
    passport.use('facebook', FacebookStrategy);

    return passport;
}


var insertTempUser = function(password, tempUserData, callback) {
    // password may or may not be hashed
    tempUserData[options.passwordFieldName] = password;
    var newTempUser = new options.tempUserModel();
    Object.keys(tempUserData).forEach(key => {
        newTempUser[key] = tempUserData[key];
    })
    console.log(newTempUser);
    newTempUser.save(function(err, tempUser) {
      if (err) {
        return callback(err, null, null);
      }
      return callback(null, null, tempUser);
    });
  };
// module.exports = passport;

/*
router.post('/auth/signup', function(req, res, next) {
  var email = req.body.email;

  // register button was clicked
  if (req.body.type === 'register') { //if type is not 'register', will resend verification email
    var pw = req.body.pw;
    var newUser = new User({
      email: email,
      pw: pw
    });

    emailVerification.createTempUser(newUser, function(err, existingPersistentUser, newTempUser) {
      if (err) {
        return res.status(404).send('ERROR: creating temporary user FAILED');
      }

      // user already exists in persistent collection
      if (existingPersistentUser) {
        return res.json({
          msg: 'You have already signed up and confirmed your account. Did you forget your password?'
        });
      }

      // new user created
      if (newTempUser) {
        var URL = newTempUser[emailVerification.options.URLFieldName];

        emailVerification.sendVerificationEmail(email, URL, function(err, info) {
          if (err) {
            return res.status(404).send('ERROR: sending verification email FAILED');
          }
          res.json({
            msg: 'An email has been sent to you. Please check it to verify your account.',
            info: info
          });
        });

      // user already exists in temporary collection!
      } else {
        res.json({
          msg: 'You have already signed up. Please check your email to verify your account.'
        });
      }
    });

  // resend verification button was clicked
  } else {
    emailVerification.resendVerificationEmail(email, function(err, userFound) {
      if (err) {
        return res.status(404).send('ERROR: resending verification email FAILED');
      }
      if (userFound) {
        res.json({
          msg: 'An email has been sent to you, yet again. Please check it to verify your account.'
        });
      } else {
        res.json({
          msg: 'Your verification code has expired. Please sign up again.'
        });
      }
    });
  }
});
*/