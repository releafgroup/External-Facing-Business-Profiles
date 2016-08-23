// File which handles all user related functions

var User = require('../models/user.js');


// Function for user error handling in saving user info
// @params: error from saving a user
// Output: parsed error message
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
// @params: user_id, req, res
// Output: If successful, {success: true, message : user_info}
// If not, {success: false, message: error_message}
// Possible errors are: User not found and networking issues
exports.getUserById = function(user_id, req, res) {
    User.findOne({
         '_id':user_id
    }, function(err, user){
        if(!user) return res.json({ success : false , message : 'User not found'}); 
        if(err) return res.json({success: false, message: err.message});
        
        return res.json({success: true, message: user});
    });
}

// Updates information for given User id
// @params: user_id, req, res
// Output: If successful, {success: true}
// If not, {success: false, message: error_message}
// Possible errors are attempting to modify the email or user_id and deleting a required element
exports.updateUserById = function(user_id, req, res) {
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
}

// Gets all Users
// @params: req, res
// Output: If successful, {success: true, message: list_of_users}
// If not, {success: false, message: error_message}
exports.getAllUsers = function(req, res) {
    
    User.find(function(err, users){
        if(err) return res.json({success: false, message: err.message}); 
        res.json({success: true, message: users}); 
    });

}


