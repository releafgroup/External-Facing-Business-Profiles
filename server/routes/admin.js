// Admin Routes
// Does not have POST, PUT Routes -> Leaves this to the db itself
// TODO: Eventually allow admin to DELETE and UPDATE users

var express = require('express');
var router = express.Router();
var Company = require('../models/company.js'); 
var User = require('../models/user.js');
var VolunteerAssignment = require('../models/volunteer_assignment.js'); 
var bcrypt = require('bcrypt'); 

// Get all volunteers
// TODO: implement paging later
router.route('/volunteers')
.get(function(req, res){

    User.find(function(err, users){
        if(err) return res.json({success: false, message: err.message}); 
        res.json(users); 
    });

});

// Get all businesses
// TODO: implement paging later
router.route('/companies')
.get(function(req, res){

    Company.find(function(err, assignments){
        if(err) return res.json({success: false, message: err.message}); 
        res.json(assignments); 
    });
});

// Gets, creates, or deletes relationships
// Assumes wants all in GET, whereas create and delete for one relationship
// No need for PUT
router.route('/assign')
.get(function(req, res) { // Sends list of all assignments, volunteer and company are populated with the respective information too ... [{volunteer : {}, company : {}}, {volunteer : {}, company : {}}, ..]

    VolunteerAssignment.find({})
        .populate('volunteer')
        .populate('company')
        .exec(function(err, assignments) {
            if(err) return res.json({success: false, message: err.message});
            res.json(assignments);
        });
})
.post(function(req, res) { // Assumes body contains volunteer_id and company_id as the names that contain needed information
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
        'company' : req.body.company
    }, function(err, delRes){
        if(err) return res.json({success: false, message: err.message}); 
        res.json({ success : true});
    });

});


module.exports = router;
