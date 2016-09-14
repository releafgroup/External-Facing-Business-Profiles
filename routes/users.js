module.exports = function (passport) {

    var express = require('express');
    var router = express.Router();
    var User = require('../models/user.js');
    var Project = require('../models/project.js');
    var authFunc = require('../utils/authfunc.js');
    var bcrypt = require('bcryptjs');
    var user_functions = require('../utils/user_functions.js');
    var project_functions = require('../utils/project_functions.js');
    var mongoose = require('mongoose');

    /** Route: /users/auth/signup
     * POST
     * Signups/creates a user and then authenticates (creates a session for it)
     * Input: User object
     * See 'local-signup' for more info
     */
    router.route('/auth/signup')
        .post(passport.authenticate('local-signup', {}), function (req, res) {
            return res.json({success: true, message: req.user._id});
        });

    /** Route: /users/auth/logout
     * GET
     * Logs out signed in user
     * No input
     * If success: {success: true, ...}
     */
    router.route('/auth/logout')
        .get(function (req, res) {
            req.logout();
            return res.json({success: true, message: 'logged out'});
        });

    /** Route: /users/auth/login
     * POST
     * Logs in user
     * Input: {'local.email' : email, 'local.password' : password}
     * If success: {success: true, message: user_id}
     */
    router.route('/auth/login')
        .post(passport.authenticate('local-login', {failWithError: true}), function (req, res) {
            return res.json({success: true, message: req.user._id});
        });

    router.get('/auth/facebook/login',
        passport.authenticate('facebook', {scope: ['email']}
        ));

    router.get('/auth/facebook/login/callback', passport.authenticate('facebook',
        {
            successRedirect: '/users/',
            failureRedirect: '/users/auth/facebook/login' //login page 
        }
    ));

    /** Route: /users/project/:id
     * Returns the project with the given project id
     * Look at getProjectById for more info
     */
    router.route('/project/:id')
        .get(isLoggedIn, function (req, res) {
            if (!checkUserProfilePermission(req, res)) return res.json({success: false, message: 'No permission'});
            return project_functions.getProjectById(req.params.id, req, res);
        });

    /** Route: /users/projects
     * Returns all projects
     * Look at getAllProjects for more info
     */

    router.route('/projects')
        .get(isLoggedIn, function (req, res) {
            if (!checkUserProfilePermission(req, res)) return res.json({success: false, message: 'No permission'});
            return project_functions.getAllProjects(req, res);
        });

    /** Route: /users/company/:id/projects
     * Returns all projects associated with the company with the given id
     * Look at getAllCompanyProjects for more info
     */

    router.route('/company/:id/projects')
        .get(isLoggedIn, function (req, res) {
            if (!checkUserProfilePermission(req, res)) return res.json({success: false, message: 'No permission'});
            return project_functions.getAllCompanyProjects(req.params.id, req, res);
        });


    /** Route: /users/projects/favorite/:id
     * PUT
     * favorites a project
     * :id refers to the projects id to be favorited/unfavorited
     * If success: {success: true, message: user.favorite}
     */
    router.route('/projects/favorite/:id')
        .put(isLoggedIn, function (req, res) {
            if (!checkUserProfilePermission(req, res)) return res.json({success: false, message: 'No permission'});
            return user_functions.favoriteProjectById(req.params.id, req, res);
        });

    router.route('/')
        .get(isLoggedIn, function (req, res) {
            if (!checkUserProfilePermission(req, res)) return res.json({success: false, message: 'No permission'});
            return user_functions.getUserById(req.session.passport.user.id, req, res);
        })
        .put(isLoggedIn, function (req, res) {
            if (!checkUserProfilePermission(req, res)) return res.json({success: false, message: 'No permission'});
            return user_functions.updateUserById(req.session.passport.user.id, req, res);
        });


    /** Route: /users/email
     * Checks if given email exists
     * 'email' must be passed in the req body
     * See checkIfEmailExists for more info
     */
    router.route('/email')
        .get(function (req, res) {
            return user_functions.checkIfEmailExists(req.body.email, req, res);
        });

    return router;

};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();
    return res.json({success: false, message: "Not logged in"});
}


// Checks that a session is defined and the signed in user is type volunteer
function checkUserProfilePermission(req, res) {
    if (typeof req.session.passport.user === 'undefined' || req.session.passport.user === null || req.session.passport.user.type != "volunteer") return false;
    return true;
}

