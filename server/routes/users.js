module.exports = function(passport) {

var express = require('express');
var router = express.Router();
var User = require('../models/user.js');
var Project = require('../models/project.js'); 
var authFunc = require('../utils/authfunc.js'); 
var bcrypt = require('bcryptjs');
var user_functions = require('../utils/user_functions.js');

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


/** Route: /users
 * GET: Gets all information for the signed in user
 * No inputs
 * See getUserById for more info
 * POST: Updates information for the signed in user
 * Input: User object
 * See updateUserById for more info
*/
router.route('/users/projects/:id/favorite')
.put(function(req, res) {
    
    Project.findOne({ id: req.id }, function (err, proj){
        var user = user_functions.getUserById(req.session.passport.user, req, res);
        if (user.favorite == 'undefined') {
            user.favorite = proj.id;
            proj.favorite_count++;
        } else {
            if (user.favorite == proj.id) {
                user.favorite == 'undefined';
                proj.favorite_count--;
            } else if (user.favorite != proj.id) {
                // Throw error that one cannot like another project
            }
        }
        if (proj.save()) return res.json({success: true, message : 'Project'});
    });
})

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
