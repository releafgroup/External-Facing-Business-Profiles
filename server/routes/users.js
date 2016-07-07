var express = require('express');
var router = express.Router();
var User = require('../models/user.js'); 
var authFunc = require('../utils/authfunc.js'); 
var bcrypt = require('bcrypt'); 
router.route('/')
.post(function(req, res){

    var user = new User();

    user.username = req.body.username;
    user.password = bcrypt.hashSync(req.body.password, 10); 
    user.email = req.body.email; 
    user.bio = req.body.bio; 


    user.save(function(err, user){
        if(err){
            if(err.code == 11000){
                return res.json({ success : false, message : 'A user with that username already exists'}); 
            }
            return res.send(err); 
        }   
            return res.json({ message  :'User created'}); 
    }); 

});

router.use(authFunc); 

router.get('/', function( req, res){
    User.find(function(err, users){
        if(err) res.send(err); 
        res.json(users); 
    }); 

})


router.route('/:username')
.get(function(req, res){
    console.log(req.decoded.username, req.params.username); 
    //if(req.decoded.username != req.params.username) return res.status(400).send({ success : false, message : "you are not authorised to change this user"});
    User.findOne({
         username : req.params.username 
    }, function(err, user){
        if(err) return res.send(err); 
        if(!user) return res.json({ success : false , message : 'User not found'}); 
        else {
            res.send(user);   
        }          
    }); 

})
.patch(function(req,res){
 if(req.decoded.username != req.params.username) return res.status(400).send({ success : false, message : "you are not authorised to change this user"}); 
    User.findOne({
        username : req.params.username
    }, function(err, user){

        if(err) return res.send(err); 
        if(!user) return res.json({ success : false , message : 'User not found'});
        for( a in req.body){
            if(a!= "username"){
                user[a]  = req.body[a];   
                if(a == "password"){
                    user.password = bcrypt.hashSync(req.body.password, 10);                 
                }
            }
            else{
                return res.json({ success: false, message : "You cannot modify the username"});
            }
        }
        user.save(function(err){                                                                           
            if(err){                                                                                       
                if(err.code == 11000){                                                                     
                    return res.json({ success : false, message : 'A user with that username already exists'}); 
                }                                                                                          
                return res.send(err);                                                                      
            }                                                                                              
            return res.json({ message  :'User Modified'});                                                  
        });         
    }); 
})

.delete(function(req, res){
 if(req.decoded.username != req.params.username) return res.status(400).send({ success : false, message : "you are not authorised to change this user"}); 
    User.remove({
        username : req.params.username
    }, function(err, delRes){
        if(err) return res.send(err); 
        res.json({ success : true, message : 'Successfuly Deleted'});
    }); 
}); 




module.exports = router;
    


