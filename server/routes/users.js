module.exports = function(passport) {

var express = require('express');
var router = express.Router();
var User = require('../models/user.js'); 
var authFunc = require('../utils/authfunc.js'); 
var bcrypt = require('bcryptjs');
var user_functions = require('../utils/user_functions.js');


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
    
    return user_functions.getUserById(req.session.passport.user, req, res);
})
.put(isLoggedIn, function(req,res){
    if (!checkUserProfilePermission(req, res)) return res.json({success: false, message : 'No permission'});
    return user_functions.updateUserById(req.session.passport.user, req, res);
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
