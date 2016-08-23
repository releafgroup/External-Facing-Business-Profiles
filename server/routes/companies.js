var express = require('express');
var router = express.Router();
var Company = require('../models/company.js'); 
var bcrypt = require('bcryptjs');
var company_functions = require('../utils/company_functions.js');


// Function for company error handling in saving company info
function handleCompanySaveError(err) {
    // Check if business name already exists
    if (err.code == 11000) {
        err.message = "A company with that business name already exists";
    } else {
        // If company validation, gets one of the errors to return
        if (err.message == "Company validation failed") {
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
    var company = new Company();
    // Populate Information
    for( a in req.body){
        if(a!= "password"){
            company[a]  = req.body[a];   
        } else {
            if (req.body.password.length < 8 || req.body.password.length > 64) {
                return res.json({success: false, message: 'password does not fit the required length'});
            } 
            company.password = bcrypt.hashSync(req.body.password, 10);                 
        }
    }
    company.save(function(err, company){
        if(err){
            return res.json({success: false, message: handleCompanySaveError(err)});
        }   
            return res.json({id: company.id, success  : true}); // Returns company id
    }); 

});


router.route('/:id')
.get(function(req, res){
    return company_functions.getCompanyById(req.params.id, req, res);    
})
.put(function(req,res){
    return company_functions.updateCompanyById(req.params.id, req, res);         
});



module.exports = router;
    



