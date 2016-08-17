
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


module.exports = function(passport) {

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
            if(a!= "id" && a != 'email' && a != "_id"){
                user[a]  = req.body[a];   
                if(a == "password"){
                    if ((req.body.password.length < 8 || req.body.password.length > 64)) {
                        return res.json({success: false, message: "Password not valid"}); // TODO: move to user.js
                    }
                    user[a] = user.generateHash(req.body[a]);                 
                }
            } else if (a == 'email') {
                if (req.body[a] != user[a]) return res.json({ success: false, message : "You cannot modify the email"});
            } else {
                if (user[a] != req.body[a]) return res.json({ success: false, message : "You cannot modify the id"}); // TODO: check
            }
        }
        user.save(function(err){                                                                           
            if(err){                                                                                       
               return res.json({success: false, message: handleUserSaveError(err)});                                                                   
            }                                                                                              
            return res.json({success: true});                                                  
        });         
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

