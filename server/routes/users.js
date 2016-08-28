
// Function for user error handling in saving user info
function handleUserSaveError(err) {
    // Check if email already exists
    if (err.code == 11000) {
        err.message = "A user with that email already exists";
    } else {
        // If user validation, gets one of the errors to return
        if (err.message == "User validation failed") {
            var one_error;
            for (first in err.errors) { // Get one of the errors
                one_error = err.errors[first];
                break;
            }
            // If it is one of the required ones i.e. Path 'XXXX' is required we change it to just XXXX is required
            if (/ is required/.test(one_error.message)) {
                one_error.message = one_error.message.replace(/^Path /gi, '');
            }
            err.message = one_error.message;
        }
    }
    return err.message;
}


module.exports = function(passport, emailVerification) {

var express = require('express');
var router = express.Router();
var User = require('../models/user.js'); 
var authFunc = require('../utils/authfunc.js'); 
var bcrypt = require('bcryptjs'); 

router.route('/auth/signup')
.post(passport.authenticate('local-signup', {}), function(req, res) {return res.json({success: true, message: req.user._id});});


router.route('/auth/logout')
.get(function(req, res) {
		req.logout();
        return res.json({success: true, message: 'logged out'});
});

router.route('/auth/login')
.post(passport.authenticate('local-login', {}), function(req, res) {return res.json({success: true, message: req.user._id});});

router.get('/auth/facebook/login',
    passport.authenticate('facebook', { scope: ['email'] }
));

router.get('/auth/facebook/login/callback',  passport.authenticate('facebook',
        { 
            successRedirect: '/users/',
            failureRedirect: '/users/auth/facebook/login' //login page 
        }
));


router.route('/')
.get(isLoggedIn, function(req, res){
    if (!checkUserProfilePermission(req, res)) return res.json({success: false, message : 'No permission'});
    
    User.findOne({
         '_id':req.session.passport.user
    }, function(err, user){
        if(!user) return res.json({ success : false , message : 'User not found'}); 
        if(err) return res.json({success: false, message: err.message});
        res.json({success: true, message: user});
    }); 

})
.put(isLoggedIn, function(req,res){
    if (!checkUserProfilePermission(req, res)) return res.json({success: false, message : 'No permission'});

    User.findOne({
        '_id':req.session.passport.user
    }, function(err, user){
        if(!user) return res.json({ success : false , message : 'User not found'});
        if(err) return res.json({success: false, message: err.message});
        for( a in req.body){
            if(a !== "id" && a !== 'local.email' && a !== "_id" && a !== 'facebook.id'){
                user[a]  = req.body[a];   
                if(a === "local.password"){
                    if ((req.body[a].length < 8 || req.body[a].length > 64)) {
                        return res.json({success: false, message: "Password not valid"}); // TODO: move to user.js
                    }
                    user.setItem(a, user.generateHash(req.body[a]));
                }
            } else if (a === 'local.email') {
                if (req.body[a] !== user.getItem(a)) return res.json({ success: false, message : "You cannot modify the email"});
            } else if (a === 'facebook.id') {
                if (req.body[a] !== user.getItem(a)) return res.json({ success: false, message : "You cannot modify the facebook id"});
            } else {
                if (user.getItem(a) !== req.body[a]) return res.json({ success: false, message : "You cannot modify the id"}); // TODO: check
            }
        }

        user.save(function(err){                                                                           
            if(err){                                                                                       
               return res.json({success: false, message: handleUserSaveError(err)});                                                                   
            }
            if (user.signupType !== 'local') { user.fullUserFormSumitted = true } // start requiring default fields
            return res.json({success: true});                                                  
        });         
    }); 
});

// email confirmation
router.route('/auth/email-verification/:URL')
.get(function(req, res) {
  var url = req.params.URL;

  emailVerification.confirmTempUser(url, function(err, user) {
    if (user) {
      emailVerification.sendConfirmationEmail(user.local.email, function(err, info) {
        if (err) {
          return res.status(404).send('ERROR: sending confirmation email FAILED');
        }
        res.json({
          msg: 'User confirmed!',
          info: info
        });
      });
    } else {
      return res.status(404).send('ERROR: confirming temporary user FAILED');
    }
  });
});

return router;

};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
	if (req.isAuthenticated())
		return next();
    return res.json({success: false, message: "Not logged in"});
}

// TODO: check if this is actually the best way to do this
// Checks that passport user is defined
// TODO: likley redudant with isLoggedIn
function checkUserProfilePermission(req, res) {
    if( typeof req.session.passport.user === 'undefined' || req.session.passport.user === null ) return false; // TODO: when add sessions to admin + company, might need to change this. basically uses to make sure only UserSchema access routes in here
    return true;
}

