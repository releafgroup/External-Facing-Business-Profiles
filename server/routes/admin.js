// Admin Routes
// Does not have POST, PUT Routes -> Leaves this to the db itself
// TODO: Eventually allow admin to DELETE and UPDATE users

module.exports = function(passport) {

var express = require('express');
var router = express.Router();
var Company = require('../models/company.js'); 
var User = require('../models/user.js');
var Project = require('../models/project.js');
var Admin = require('../models/admin.js');
var VolunteerAssignment = require('../models/volunteer_assignment.js'); 
var bcrypt = require('bcryptjs'); 
var user_functions = require('../utils/user_functions.js');
var company_functions = require('../utils/company_functions.js');
var project_functions = require('../utils/project_functions.js');
var path = require('path');
var env = require('node-env-file');
env(path.join(__dirname, '../.env'));

//////////////////////////////////////////////////// LOGIN //////////////////////////

router.route('/auth/logout')
.get(function(req, res) {
		req.logout();
        return res.json({success: true, message: 'logged out'});
});

router.route('/auth/login')
.post(passport.authenticate('admin-login', {}), function(req, res) {return res.json({success: true, message: req.user._id});}); //TODO: user or admin???

// Only make available in dev/testing environment
// TODO: test in production
if (process.env.NODE_ENV !== 'production') {
    router.route('/')
    .post(function(req, res) {
    
        var newAdmin = new Admin();
        newAdmin['password'] = newAdmin.generateHash(req.body['password']);
        newAdmin['name'] = req.body['name'];
        console.log(newAdmin);
        newAdmin.save(function(err) {
            if (err) {
                return res.json({success: false, message: err.message});
            }
            return res.json({success: true, message : newAdmin._id});
        });
    });
}

//////////////////////////////////////////////////// GET REQUESTS ///////////////////

// Get all volunteers
// TODO: implement paging later
router.route('/volunteers')
.get(function(req, res){
    if (!checkAdminProfilePermission(req, res)) return res.json({success: false, message : 'No permission'});
    return user_functions.getAllUsers(req, res);    

});

// Get single volunteer
router.route('/volunteers/:id')
.get(function(req, res){
    if (!checkAdminProfilePermission(req, res)) return res.json({success: false, message : 'No permission'});    
    return user_functions.getUserById(req.params.id, req, res);

})

// Get all businesses
// TODO: implement paging later
router.route('/companies')
.get(isLoggedIn, function(req, res){
    if (!checkAdminProfilePermission(req, res)) return res.json({success: false, message : 'No permission'});    
    return company_functions.getAllCompanies(req, res);

});

// Get single company
router.route('/companies/:id')
.get(isLoggedIn, function(req, res){
    if (!checkAdminProfilePermission(req, res)) return res.json({success: false, message : 'No permission'});    
    return company_functions.getCompanyById(req.params.id, req, res);

})

// Get all projects
// TODO: implement paging later
router.route('/projects')
.get(isLoggedIn, function(req, res){
    if (!checkAdminProfilePermission(req, res)) return res.json({success: false, message : 'No permission'});    
    return project_functions.getAllProjects(req, res);
});

// Get single project
router.route('/projects/:id')
.get(isLoggedIn, function(req, res){ // TODO: add in extracting info from company
    if (!checkAdminProfilePermission(req, res)) return res.json({success: false, message : 'No permission'});    
    return project_functions.getProjectById(req.params.id, req, res);
    
})
///////////////////////////////////////////////////////////////////////


//IMPORTANT!!!!!!!!! TODO: Below This (besides auth functions) need to be revised likely

//////////////////////////////////////////////////// PROJECT VERIFICATION ///////////////////

router.route('/projects/verify/:id') // Only looks at is_verified parameter
.put(isLoggedIn, function(req, res) {
    if (!checkAdminProfilePermission(req, res)) return res.json({success: false, message : 'No permission'});    
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
.get(isLoggedIn, function(req, res) { // Sends list of all assignments, volunteer and project are populated with the respective information too ... [{volunteer : {}, project : {}}, {volunteer : {}, project : {}}, ..]
    if (!checkAdminProfilePermission(req, res)) return res.json({success: false, message : 'No permission'});    
    VolunteerAssignment.find({})
        .populate('volunteer')
        .populate('project')
        .exec(function(err, assignments) {
            if(err) return res.json({success: false, message: err.message});
            res.json(assignments);
        });
})
.post(isLoggedIn, function(req, res) { // Assumes body contains volunteer_id as 'volunteer' and project_id as 'project' as the names that contain needed information
    if (!checkAdminProfilePermission(req, res)) return res.json({success: false, message : 'No permission'});    
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
.delete(isLoggedIn, function(req, res) { // Assumes FE sending in the volunteer + company ID. Could change to send in the relationship's id
    if (!checkAdminProfilePermission(req, res)) return res.json({success: false, message : 'No permission'});    
    VolunteerAssignment.remove({
        'volunteer' : req.body.volunteer,
        'project' : req.body.project
    }, function(err, delRes){
        
        if(err) return res.json({success: false, message: err.message}); 
        res.json({ success : true});
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
function checkAdminProfilePermission(req, res) {
    if( typeof req.session.passport.user === 'undefined' || req.session.passport.user === null || req.session.passport.user.type != "admin") return false;
    return true;
}
