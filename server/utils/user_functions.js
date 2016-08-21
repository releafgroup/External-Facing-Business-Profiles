// File which handles all user related functions

var User = require('../models/user.js');


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

var exports = module.exports = {};


// Gets information for given User id

exports.getUserById = function(user_id, req, res) {
    User.findOne({
         '_id':user_id
    }, function(err, user){
        console.log("ddddddd");
        if(!user) return JSON.stringify({ success : false , message : 'User not found'}); 
        if(err) return JSON.stringify({success: false, message: err.message});
        
        return res.json({success: true, message: user});
    });
}

// Updates information for given User id

exports.updateUserById = function(user_id, req, res) {
    User.findOne({
        '_id':user_id
    }, function(err, user){
        if(!user) return res.json({ success : false , message : 'User not found'});
        if(err) return res.json({success: false, message: err.message});
        for( a in req.body){
            if(a!= "id" && a != 'email' && a != "_id"){
                user[a]  = req.body[a];   
                if(a == "password"){
                    if ((req.body.password.length < 8 || req.body.password.length > 64)) {
                        return res.json({success: false, message: "Password not valid"});
                    }
                    user[a] = user.generateHash(req.body[a]);                 
                }
            } else if (a == 'email') {
                if (req.body[a] != user[a]) return res.json({ success: false, message : "You cannot modify the email"});
            } else {
                if (user[a] != req.body[a]) return res.json({ success: false, message : "You cannot modify the id"});
            }
        }
        user.save(function(err){                                                                           
            if(err){                                                                                       
               return res.json({success: false, message: handleUserSaveError(err)});
            }                                                                                              
            return res.json({success: true});                    
        });         
    });
}

// Gets all Users

exports.getAllUsers = function(req, res) {
    
    User.find(function(err, users){
        if(err) return res.json({success: false, message: err.message}); 
        res.json({success: true, message: users}); 
    });

}


