var express = require('express');
var router = express.Router();
var User = require('../models/user.js'); 
var authFunc = require('../utils/authfunc.js'); 
var bcrypt = require('bcrypt'); 


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
    

router.route('/')
.post(function(req, res){
    var user = new User();
    // Populate Information
    for( a in req.body){
        if(a!= "password"){
            user[a]  = req.body[a];   
        } else {
            if (req.body.password.length < 8 || req.body.password.length > 64) {
                return res.json({success: false, message: "Password not valid"}); // TODO: move to user.js
            }
            user.password = bcrypt.hashSync(req.body.password, 10);                 
        }
    }
    user.save(function(err, user){
        if(err){
            return res.json({success: false, message: handleUserSaveError(err)});
        }   
            return res.json({id: user.id, success  : true}); // Returns user id
    }); 

});

//router.use(authFunc); 

router.get('/', function( req, res){
    User.find(function(err, users){
        if(err) return res.json({success: false, message: err.message}); 
        res.json(users); 
    }); 

})

// Use to get id for an email
router.get('/id', function(req, res) {
    User.findOne({
        'email':req.body.email
    }, function(err, user) {
        if(!user) return res.json({ success : false , message : 'User not found'});
        if(err) return res.json({success: false, message: err.message});
        res.json({success: true, id: user.id});
    });
});


router.route('/:id')
.get(function(req, res){
    //console.log(req.decoded.id, req.params.id); 
    //if(req.decoded.id != req.params.id) return res.status(400).send({ success : false, message : "you are not authorised to change this user"});
    User.findOne({
         '_id':req.params.id
    }, function(err, user){
        if(!user) return res.json({ success : false , message : 'User not found'}); 
        if(err) return res.json({success: false, message: err.message});
        res.json(user);   
    }); 

})
.put(function(req,res){
    //if(req.decoded.id != req.params.id) return res.status(400).send({ success : false, message : "you are not authorised to change this user"}); 
    User.findOne({
        '_id':req.params.id
    }, function(err, user){
        if(!user) return res.json({ success : false , message : 'User not found'});
        if(err) return res.json({success: false, message: err.message});
        for( a in req.body){
            if(a!= "id" && a != 'email'){
                user[a]  = req.body[a];   
                if(a == "password"){
                    if ((req.body.password.length < 8 || req.body.password.length > 64)) {
                        return res.json({success: false, message: "Password not valid"}); // TODO: move to user.js
                    }
                    user.password = bcrypt.hashSync(req.body.password, 10);                 
                }
            } else if (a == 'email') {
                if (req.body[a] != user[a]) return res.json({ success: false, message : "You cannot modify the email"});
            } else {
                return res.json({ success: false, message : "You cannot modify the id"}); // TODO: check
            }
        }
        user.save(function(err){                                                                           
            if(err){                                                                                       
               return res.json({success: false, message: handleUserSaveError(err)});                                                                   
            }                                                                                              
            return res.json({success: true});                                                  
        });         
    }); 
})

.delete(function(req, res){
 //if(req.decoded.id != req.params.id) return res.status(400).send({ success : false, message : "you are not authorised to change this user"}); 
    User.remove({
        '_id':req.params.id
    }, function(err, delRes){
        if(err) return res.json({success: false, message: err.message}); 
        res.json({ success : true});
    }); 
}); 




module.exports = router;
    


