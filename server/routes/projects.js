var express = require('express');
var router = express.Router();
var Project = require('../models/project.js');
var Company = require('../models/company.js');
var bcrypt = require('bcryptjs'); 
var project_functions = require('../utils/project_functions.js');

// Function for project error handling in saving project info
function handleProjectSaveError(err) {
    // If project validation, gets one of the errors to return
    if (err.message == "Project validation failed") {
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
    return err.message;
}
    

router.route('/')
.post(function(req, res){ // Assumes company id is passed in as '_company'
    var project = new Project();
    // Populate Information
    for( a in req.body){
        project[a]  = req.body[a];
    }

    if (project['is_verified'] == true) return res.json({success: false, message: "Cannot set verified to true"});
    
    // First make sure company is real and can be found
    Company.findOne({
         '_id':project['_company']
    }, function(err, company){
        
        if (!company) return res.json({ success : false , message : 'Company not found'}); 
        if (err) return res.json({success: false, message: err.message});
        // Next save project
        project.save(function(proj_err, project) {
            if (proj_err) {
                return res.json({success: false, message: handleProjectSaveError(proj_err)});
            }
            
            // Finally, add to company schema
            company.projects.push(project);
            company.save(function(final_err, succ) {
                if (!final_err) return res.json({id: project.id, success  : true}); // Returns project id
                return res.json({success: false, message: final_err.message});
            });
        });
    });
});


router.route('/:id')
.get(function(req, res){ // TODO: add in extracting info from company
    return project_functions.getProjectById(req.params.id, req, res);
})
.put(function(req,res){
    return project_functions.updateProjectById(req.params.id, req, res);
})

.delete(function(req, res){
    Project.remove({
        '_id':req.params.id
    }, function(err, delRes){
        if(err) return res.json({success: false, message: err.message});
        
        // TODO: delete from company's array and add unit test in mocha
        // TODO: delete from VolunteerAssignment and add unit test in mocha

        res.json({ success : true});
    }); 
}); 


module.exports = router;
