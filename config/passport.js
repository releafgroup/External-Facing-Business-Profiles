const passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    mongoose = require('mongoose'),
    BusinessOwner = mongoose.model('BusinessOwner');


// Serialize sessions
passport.serializeUser((user, done) => {
    done(null, user.id);
});

// Deserialize sessions
passport.deserializeUser((id, done) => {
    BusinessOwner.findOne({
        _id: id
    }, '-salt -hash', (err, user) => {
        done(err, user);
    });
});

passport.use(new LocalStrategy({
    usernameField: 'email'
  },
  (username, password, done) => {
    BusinessOwner.findOne({ email: username }, function (err, user) {
      if (err) { return done(err); }
      // Return if user not found in database
      if (!user) {
        return done(null, false, {
          message: 'User not found'
        });
      }
      // Return if password is wrong
      if (!user.validPassword(password)) {
        return done(null, false, {
          message: 'Password is wrong'
        });
      }
      // If credentials are correct, return the user object
      return done(null, user);
    });
  }
));