// Admin Routes
// Does not have POST, PUT Routes -> Leaves this to the db itself
// TODO: Eventually allow admin to DELETE and UPDATE users

var express = require('express');
var router = express.Router();
var Company = require('../models/company.js'); 
var User = require('../models/user.js');
var Project = require('../models/project.js'); 
var VolunteerAssignment = require('../models/volunteer_assignment.js'); 
var bcrypt = require('bcryptjs'); 


//////////////////////////////////////////////////// GET REQUESTS ///////////////////

// Get all volunteers
// TODO: implement paging later
router.route('/volunteers')
.get(function(req, res){

    User.find(function(err, users){
        if(err) return res.json({success: false, message: err.message}); 
        res.json(users); 
    });

});

// Get single volunteer
router.route('/volunteers/:id')
.get(function(req, res){
    User.findOne({
         '_id':req.params.id
    }, function(err, user){
        if(!user) return res.json({ success : false , message : 'User not found'}); 
        if(err) return res.json({success: false, message: err.message});
        res.json(user);   
    }); 

})

// Get all businesses
// TODO: implement paging later
router.route('/companies')
.get(function(req, res){

    Company.find(function(err, companies){
        if(err) return res.json({success: false, message: err.message}); 
        res.json(companies); 
    });
});

// Get single company
router.route('/companies/:id')
.get(function(req, res){
    Company.findOne({
         '_id':req.params.id
    }, function(err, company){
        if(!company) return res.json({ success : false , message : 'Company not found'}); 
        if(err) return res.json({success: false, message: err.message});
        res.json(company);   
    }); 

})

// Get all projects
// TODO: implement paging later
router.route('/projects')
.get(function(req, res){

    Project.find(function(err, projects){
        if(err) return res.json({success: false, message: err.message}); 
        res.json(projects); 
    });
});

// Get single project
router.route('/projects/:id')
.get(function(req, res){ // TODO: add in extracting info from company
    Project.findOne({
         '_id':req.params.id
    }, function(err, project){
        if(!project) return res.json({ success : false , message : 'Project not found'}); 
        if(err) return res.json({success: false, message: err.message});
        res.json(project);   
    }); 

})
///////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////// PROJECT VERIFICATION ///////////////////

router.route('/projects/verify/:id') // Only looks at is_verified parameter
.put(function(req, res) {
     Project.findOne({
        '_id':req.params.id
    }, function(err, project){
        if(!project) return res.json({ success : false , message : 'Project not found'});
        if(err) return res.json({success: false, message: err.message});
        if (typeof req.body['is_verified'] == 'undefined') return res.json({success: false, message: "Needed body parameter not passed in"});
        project['is_verified'] = req.body['is_verified'] ;
        project.save(function(err){
            if(err){                                                                                       
               return res.json({success: false, message: err.message});                                                                   
            }                                                                                              
            return res.json({success: true});                                                  
        });
    });
});


//////////////////////////////////////////////////// ASSIGNMENTS ///////////////////

// Gets, creates, or deletes relationships
// Assumes wants all in GET, whereas create and delete for one relationship
// No need for PUT
router.route('/assign')
.get(function(req, res) { // Sends list of all assignments, volunteer and project are populated with the respective information too ... [{volunteer : {}, project : {}}, {volunteer : {}, project : {}}, ..]

    VolunteerAssignment.find({})
        .populate('volunteer')
        .populate('project')
        .exec(function(err, assignments) {
            if(err) return res.json({success: false, message: err.message});
            res.json(assignments);
        });
})
.post(function(req, res) { // Assumes body contains volunteer_id as 'volunteer' and project_id as 'project' as the names that contain needed information
    
    var volunteer_assignment = new VolunteerAssignment();

    for( a in req.body) {
        volunteer_assignment[a] = req.body[a];
    }

    volunteer_assignment.save(function(err, volunteer_assignment){
        if(err){
            console.log(err);
            return res.json({success: false, message: err.message});
        }   
            return res.json({success  : true});
    });
})
.delete(function(req, res) { // Assumes FE sending in the volunteer + company ID. Could change to send in the relationship's id

    VolunteerAssignment.remove({
        'volunteer' : req.body.volunteer,
        'project' : req.body.project
    }, function(err, delRes){
        
        if(err) return res.json({success: false, message: err.message}); 
        res.json({ success : true});
    });

});


module.exports = router;
