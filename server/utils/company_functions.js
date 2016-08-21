var Company = require('../models/company.js');

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


var exports = module.exports = {};


// Gets information for given Company id

exports.getCompanyById = function(company_id, req, res) {
    Company.findOne({
         '_id':company_id
    }, function(err, company){
        if(!company) return res.json({ success : false , message : 'Company not found'}); 
        if(err) return res.json({success: false, message: err.message});
        return res.json({success: true, message: company});   
    });
}

// Updates information for given Company id

exports.updateCompanyById = function(company_id, req, res) {
   Company.findOne({
        '_id':company_id
    }, function(err, company){
        if(!company) return res.json({ success : false , message : 'Company not found'});
        if(err) return res.json({success: false, message: err.message});
        for( a in req.body){
            if(a!= "id" && a != "business_name" && a != "_id"){
                company[a]  = req.body[a];   
                if(a == "password"){
                    company.password = bcrypt.hashSync(req.body.password, 10);                 
                }
            } else if (a == "business_name") {
                if (req.body[a] != company[a]) return res.json({ success: false, message : "You cannot modify the business name"});                
            } else {
                if (company[a] != req.body[a]) return res.json({ success: false, message : "You cannot modify the id"});
            }
        }
        company.save(function(err){
            if(err){                                                                                       
               return res.json({success: false, message: handleCompanySaveError(err)});                                                                   
            }                                                                                              
            return res.json({success: true});                                                  
        });         
    });
}

// Gets all Companies
exports.getAllCompanies = function(req, res) {
    
    Company.find(function(err, companies){
        if(err) return res.json({success: false, message: err.message}); 
        res.json({success: true, message: companies}); 
    });
}
