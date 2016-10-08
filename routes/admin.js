/**
 *  Admin Routes
 *  Does not have POST, PUT Routes -> Leaves this to the db itself
 *  TODO: Eventually allow admin to DELETE and UPDATE users
 */
module.exports = function (passport) {

    var express = require('express');
    var router = express.Router();
    var Company = require('../models/company');
    var User = require('../models/user');
    var Project = require('../models/project');
    var Admin = require('../models/admin');
    var VolunteerAssignment = require('../models/volunteer_assignment');
    var bcrypt = require('bcryptjs');
    var user_functions = require('../utils/user');
    var company_functions = require('../utils/company');
    var project_functions = require('../utils/project');
    var path = require('path');

    /**
     * Authentication
     */
    /** Route: /admin/auth/logout
     * GET
     * Logs out signed in admin
     * No input
     * If success: {success: true, ...}
     */
    router.route('/auth/logout')
        .get(function (req, res) {
            req.logout();
            return res.json({success: true, message: 'logged out'});
        });

    /** Route: /admin/auth/login
     * POST
     * Logs in admin
     * Input: {'name' : name, 'password' : password}
     * If success: {success: true, message: admin_id}
     */
    router.route('/auth/login')
        .post(passport.authenticate('admin-login', {}), function (req, res) {
            return res.json({success: true, message: req.user._id});
        }); //TODO: user or admin???

    /**
     * Only make available in dev/testing environment
     * TODO: test in production
     */
   
    router.route('/')
        .post(function (req, res) {
            // if (!checkAdminProfilePermission(req, res)) return res.json({success: false, message: 'No permission'});

            var newAdmin = new Admin();
            newAdmin['password'] = newAdmin.generateHash(req.body['password']);
            newAdmin['name'] = req.body['name'];
            newAdmin.save(function (err) {
                if (err) {
                    return res.json({success: false, message: err.message});
                }
                return res.json({success: true, message: newAdmin._id});
            });
        });

    router.route('/')
        .get(function (req, res) {
            // if (!checkAdminProfilePermission(req, res)) return res.json({success: false, message: 'No permission'});

            Admin.find({}, function (err, admin) {
                if (err) return res.json({success: false, message: err.message});
                res.json({success: true, message: admin});
            });
        })

    /**
     * Get Requests
     */
    /** Route: /admin/volunteers
     * GET
     * No input
     * Returns list of all volunteers
     * If success: {success: true, message: [volunteers]}
     * If failure: {success: false, ...}
     * See getAllUsers for more info
     */
    router.route('/volunteers')
        .get(function (req, res) {
            if (!checkAdminProfilePermission(req, res)) return res.json({success: false, message: 'No permission'});
            return user_functions.getAllUsers(req, res);

        });

    /** Route: /admin/volunteers/:id
     * GET
     * No input
     * Returns volunteer with id
     * If success: {success: true, message: volunteer}
     * If failure: {success: false, ...}
     * See getUserById for more info
     */
    router.route('/volunteers/:id')
        .get(function (req, res) {
            if (!checkAdminProfilePermission(req, res)) return res.json({success: false, message: 'No permission'});
            return user_functions.getUserById(req.params.id, req, res);

        });

    /** Route: /admin/companies
     * GET
     * No input
     * Returns list of all companies
     * If success: {success: true, message: [companies]}
     * If failure: {success: false, ...}
     * See getAllCompanies for more info
     */
    router.route('/companies')
        .get(isLoggedIn, function (req, res) {
            if (!checkAdminProfilePermission(req, res)) return res.json({success: false, message: 'No permission'});
            return company_functions.getAllCompanies(req, res);

        });

    /** Route: /admin/companies/:id
     * GET
     * No input
     * Returns company with id
     * If success: {success: true, message: company}
     * If failure: {success: false, ...}
     * See getCompanyById for more info
     */
    router.route('/companies/:id')
        .get(isLoggedIn, function (req, res) {
            if (!checkAdminProfilePermission(req, res)) return res.json({success: false, message: 'No permission'});
            return company_functions.getCompanyById(req.params.id, req, res);

        });

    /** Route: /admin/projects
     * GET
     * No input
     * Returns list of all projects
     * If success: {success: true, message: [projects]}
     * If failure: {success: false, ...}
     * See getAllProjects for more info
     */
    router.route('/projects')
        .get(isLoggedIn, function (req, res) {
            if (!checkAdminProfilePermission(req, res)) return res.json({success: false, message: 'No permission'});
            return project_functions.getAllProjects(req, res);
        });

    /** Route: /admin/projects/:id
     * GET
     * No input
     * Returns project with id
     * If success: {success: true, message: project}
     * If failure: {success: false, ...}
     * See getProjectById for more info
     */
    router.route('/projects/:id')
        .get(isLoggedIn, function (req, res) { // TODO: add in extracting info from company
            if (!checkAdminProfilePermission(req, res)) return res.json({success: false, message: 'No permission'});
            return project_functions.getProjectById(req.params.id, req, res);
        });

    router.route('/company/:id/projects')
        .get(isLoggedIn, function (req, res) {
            if (!checkUserProfilePermission(req, res)) return res.json({success: false, message: 'No permission'});
            return project_functions.getAllCompanyProjects(req.params.id, req, res);
        });

    /**
     * PROJECT VERIFICATION
     * IMPORTANT! TODO: Below This (besides auth functions) need to be revised likely
     */
    router.route('/projects/verify/:id') // Only looks at is_verified parameter
        .put(isLoggedIn, function (req, res) {
            if (!checkAdminProfilePermission(req, res)) return res.json({success: false, message: 'No permission'});
            Project.findOne({
                '_id': req.params.id
            }, function (err, project) {
                if (!project) return res.json({success: false, message: 'Project not found'});
                if (err) return res.json({success: false, message: err.message});
                if (typeof req.body['is_verified'] == 'undefined') return res.json({
                    success: false,
                    message: "Needed body parameter not passed in"
                });
                project['is_verified'] = req.body['is_verified'];
                project.save(function (err) {
                    if (err) {
                        return res.json({success: false, message: err.message});
                    }
                    return res.json({success: true});
                });
            });
        });

    /**
     * ASSIGNMENTS
     * Gets, creates, or deletes relationships
     * Assumes wants all in GET, whereas create and delete for one relationship
     * No need for PUT
     */
    router.route('/assign')
        .get(isLoggedIn, function (req, res) {
            // Sends list of all assignments, volunteer and project are populated with the respective information too
            // [{volunteer : {}, project : {}}, {volunteer : {}, project : {}}, ..]
            if (!checkAdminProfilePermission(req, res)) return res.json({success: false, message: 'No permission'});
            VolunteerAssignment.find({})
                .populate('volunteer')
                .populate('project')
                .exec(function (err, assignments) {
                    if (err) return res.json({success: false, message: err.message});
                    res.json(assignments);
                });
        })
        .post(isLoggedIn, function (req, res) {
            // Assumes body contains volunteer_id as 'volunteer' and
            // project_id as 'project' as the names that contain needed information
            if (!checkAdminProfilePermission(req, res)) return res.json({success: false, message: 'No permission'});
            var volunteer_assignment = new VolunteerAssignment();

            for (var a in req.body) {
                volunteer_assignment[a] = req.body[a];
            }

            volunteer_assignment.save(function (err, volunteer_assignment) {
                if (err) {
                    return res.json({success: false, message: err.message});
                }
                return res.json({success: true});
            });
        })
        .delete(isLoggedIn, function (req, res) {
            // Assumes FE sending in the volunteer + company ID. Could change to send in the relationship's id
            if (!checkAdminProfilePermission(req, res)) return res.json({success: false, message: 'No permission'});
            VolunteerAssignment.remove({
                'volunteer': req.body.volunteer,
                'project': req.body.project
            }, function (err, delRes) {

                if (err) return res.json({success: false, message: err.message});
                res.json({success: true});
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
    return !(typeof req.session.passport.user === 'undefined' || req.session.passport.user === null ||
    req.session.passport.user.type != "admin");
}
