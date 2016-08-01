var express = require('express');
var router = express.Router();
var User = require('../models/user.js'); 
var authFunc = require('../utils/authfunc.js'); 
var bcrypt = require('bcrypt'); 
router.route('/')
.post(function(req, res){
    var user = new User();
    // Populate Information
    for( a in req.body){
        console.log(a);
        if(a!= "password"){
            user[a]  = req.body[a];   
        } else {
            user.password = bcrypt.hashSync(req.body.password, 10);                 
        }
    }
    console.log(user);
    user.save(function(err, user){
        if(err){
            // TODO: figure out how we want to structure error messages and success
           //console.log(err);
           // if(err.code == 11000){
           //     return res.json({ success : false, message : 'A user with that id already exists'}); 
           // }
           console.log("Siushsuhsiushuisiuhs");
            return res.send(err); 
        }   
            console.log("success");
            return res.json({ message  :'User created'}); 
    }); 

});

//router.use(authFunc); 

router.get('/', function( req, res){
    User.find(function(err, users){
        if(err) res.send(err); 
        res.json(users); 
    }); 

})


router.route('/:id')
.get(function(req, res){
    //console.log(req.decoded.id, req.params.id); 
    //if(req.decoded.id != req.params.id) return res.status(400).send({ success : false, message : "you are not authorised to change this user"});
    User.findOne({
         '_id':req.params.id
    }, function(err, user){
        // TODO: figure out error handling
        if(err) return res.send(err); 
        if(!user) return res.json({ success : false , message : 'User not found'}); 
        else {
            res.send(user);   
        }          
    }); 

})
.put(function(req,res){
 if(req.decoded.id != req.params.id) return res.status(400).send({ success : false, message : "you are not authorised to change this user"}); 
    User.findOne({
        '_id':req.params.id
    }, function(err, user){

        if(err) return res.send(err); 
        if(!user) return res.json({ success : false , message : 'User not found'});
        for( a in req.body){
            if(a!= "id"){
                user[a]  = req.body[a];   
                if(a == "password"){
                    user.password = bcrypt.hashSync(req.body.password, 10);                 
                }
            }
            else{
                return res.json({ success: false, message : "You cannot modify the id"});
            }
        }
        user.save(function(err){                                                                           
            if(err){                                                                                       
                if(err.code == 11000){                                                                     
                    return res.json({ success : false, message : 'A user with that id already exists'}); 
                }                                                                                          
                return res.send(err);                                                                      
            }                                                                                              
            return res.json({ message  :'User Modified'});                                                  
        });         
    }); 
})

.delete(function(req, res){
 //if(req.decoded.id != req.params.id) return res.status(400).send({ success : false, message : "you are not authorised to change this user"}); 
    User.remove({
        '_id':req.params.id
    }, function(err, delRes){
        if(err) return res.send(err); 
        res.json({ success : true, message : 'Successfuly Deleted'});
    }); 
}); 




module.exports = router;
    


