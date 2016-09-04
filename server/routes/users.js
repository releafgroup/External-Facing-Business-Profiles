module.exports = function(passport) {

var express = require('express');
var router = express.Router();
var User = require('../models/user.js');
var Project = require('../models/project.js'); 
var authFunc = require('../utils/authfunc.js'); 
var bcrypt = require('bcryptjs');
var user_functions = require('../utils/user_functions.js');
var mongoose = require('mongoose');

/** Route: /users/auth/signup
 * POST
 * Signups/creates a user and then authenticates (creates a session for it)
 * Input: User object
 * See 'local-signup' for more info
*/

router.route('/auth/signup')
.post(passport.authenticate('local-signup', {}), function(req, res) {return res.json({success: true, message: req.user._id});});

/** Route: /users/auth/logout
 * GET
 * Logs out signed in user
 * No input
 * If success: {success: true, ...}
*/
router.route('/auth/logout')
.get(function(req, res) {
		req.logout();
        return res.json({success: true, message: 'logged out'});
});

/** Route: /users/auth/login
 * POST
 * Logs in user
 * Input: {'local.email' : email, 'local.password' : password}
 * If success: {success: true, message: user_id}
*/
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


router.route('/projects/favorite/:id')
.put(isLoggedIn, function(req, res) {
    if (!checkUserProfilePermission(req, res)) return res.json({success: false, message : 'No permission'});
    Project.findOne({'_id': req.params.id}, function (err, proj){

        if (err) return res.json({success: false, message : err.message});
        if (!proj) return res.json({sucess: false, message : "no project"});

        User.findOne({
         '_id': req.session.passport.user.id
        }, function(err2, user){

            if(err2) return res.json({ success : false , message : err2.message}); 
            if(!user) return res.json({success: false, message: "no user"});
            
            if (user.favorite) {
                if (user.favorite.equals(proj._id))  {
                    proj.favorite_count--;
                    user.favorite = undefined;
                } else {
                    return res.json({success: false, message: "can have only one favorite"});
                }
            } else {
                proj.favorite_count++;
                user.favorite = proj;
            }

            user.save(function(user_err, succ) {
                if (user_err) return res.json({success: false, message: "error occurred saving"});
                proj.save(function(proj_err, succ2) {
                    if (proj_err) return res.json({success: false, message: "error occurred saving"});
                });
                return res.json({success: true, message: user});
            });
        });
    });
});

router.route('/')
.get(isLoggedIn, function(req, res){
    if (!checkUserProfilePermission(req, res)) return res.json({success: false, message : 'No permission'});
    return user_functions.getUserById(req.session.passport.user.id, req, res);
})
.put(isLoggedIn, function(req,res){
    if (!checkUserProfilePermission(req, res)) return res.json({success: false, message : 'No permission'});
    return user_functions.updateUserById(req.session.passport.user.id, req, res);
});


/** Route: /users/email
 * Checks if given email exists
 * 'email' must be passed in the req body
 * See checkIfEmailExists for more info
*/
router.route('/email')
.get(function(req, res) {
    return user_functions.checkIfEmailExists(req.body.email, req, res);  
});

return router;

};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
	if (req.isAuthenticated())
		return next();
    return res.json({success: false, message: "Not logged in"});
}


// Checks that a session is defined and the signed in user is type volunteer
function checkUserProfilePermission(req, res) {
    console.log(req.session.passport.user);
    if( typeof req.session.passport.user === 'undefined' || req.session.passport.user === null || req.session.passport.user.type != "volunteer" ) return false;
    return true;
}
