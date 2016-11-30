module.exports = function (passport) {
    var express = require('express');
    var router = express.Router();
    var userFunctions = require('../utils/user');
    var projectFunctions = require('../utils/project');
    var permissionHelper = require('../helpers/permission');
    var volunteerEmails = require('../emails/volunteer');
    var responseUtils = require('../helpers/response');
    var User = require('../models/user');
    var config = require('../config');

    var isLoggedIn = permissionHelper.isLoggedIn;
    var checkUserProfilePermission = permissionHelper.checkUserProfilePermission;

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
            return projectFunctions.getProjectById(req.params.id, req, res);
        });

    /** Route: /users/projects
     * Returns all projects
     * Look at getAllProjects for more info
     */

    router.route('/projects')
        .get(isLoggedIn, function (req, res) {
            if (!checkUserProfilePermission(req, res)) return res.json({success: false, message: 'No permission'});
            return projectFunctions.getAllProjects(req, res);
        });

    /** Route: /users/company/:id/projects
     * Returns all projects associated with the company with the given id
     * Look at getAllCompanyProjects for more info
     */

    router.route('/company/:id/projects')
        .get(isLoggedIn, function (req, res) {
            if (!checkUserProfilePermission(req, res)) return res.json({success: false, message: 'No permission'});
            return projectFunctions.getAllCompanyProjects(req.params.id, req, res);
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
            return userFunctions.favoriteProjectById(req.params.id, req, res);
        });

    /**
     * Route: /users/projects/favorite
     * GET
     * Gets favorited project
     * If success: {success: true, message: favorited_project}
     */
    router.route('/projects/favorite')
        .get(isLoggedIn, function (req, res) {
            if (!checkUserProfilePermission(req, res)) return res.json({success: false, message: 'No permission'});
            return userFunctions.getUserFavoriteProject(req.session.passport.user.id, req, res);
        });

    router.route('/')
        .get(isLoggedIn, function (req, res) {
            if (!checkUserProfilePermission(req, res)) return res.json({success: false, message: 'No permission'});
            return userFunctions.getUserById(req.session.passport.user.id, req, res);
        })
        .put(isLoggedIn, function (req, res) {
            if (!checkUserProfilePermission(req, res)) return res.json({success: false, message: 'No permission'});
            return userFunctions.updateUserById(req.session.passport.user.id, req, res);
        });


    /** Route: /users/email
     * Checks if given email exists
     * 'email' must be passed in the req body
     * See checkIfEmailExists for more info
     */
    router.route('/email')
        .get(function (req, res) {
            return userFunctions.checkIfEmailExists(req.query.email, req, res);
        });


    /** Route: /users/email/verify
     * Verifies user's email
     * 'token' must be passed in the req body
     */
    router.route('/email/verify')
        .post(function (req, res) {
            return userFunctions.verifyEmail(req.body.token, req, res);
        });

    /** Route: /user/email/verify/resend
     * Resend verification email to user
     * 'email' must be passed in the req body
     */
    router.route('/email/verify/resend')
        .post(function (req, res) {
            return userFunctions.resendVerificationEmail(req.body.email, req, res);
        });


    /** Route: /user/password/reset/email
     * Sends password reset email
     * 'email' must be passed in req body
     */
    router.route('/password/reset/email')
        .post(function (req, res) {
            User.findOne({'local.email': req.body.email}, function (err, user) {
                if (err) return responseUtils.sendError('An error occurred', 500, res);

                if (!user) return responseUtils.sendError('user not found', 500, res);

                volunteerEmails.sendPasswordResetEmail(user, config.feBaseUrl + '/forgotpassword/' +
                    user.getPasswordResetToken(), "Releaf <noreply@releaf.ng>");

                return responseUtils.sendSuccess(true, res);
            });

        });

    /** Route: /user/password/reset/token/verify
     * Verify reset token
     * 'token' must be passed in req body
     */
    router.route('/password/reset/token/verify')
        .post(function (req, res) {
            User.findOne({'password_reset_token': req.body.token}, function (err, user) {

                if (err) return responseUtils.sendError('An error occurred', 500, res);

                if (!user) return responseUtils.sendError('user not found', 500, res);

                return responseUtils.sendSuccess(true, res);
            });

        });

    /** Route: /user/password/change
     * Verify reset token
     */
    router.route('/password/change')
        .post(function (req, res) {
            var token = req.body.token;
            var newPassword = req.body.password;

            User.findOne({'password_reset_token': token}, function (err, user) {

                if (err) return responseUtils.sendError('An error occurred', 500, res);

                if (!user) return responseUtils.sendError('user not found', 500, res);

                user.local.password = user.generateHash(newPassword);
                user.password_reset_token = null;

                user.save(function (err) {
                    if (err) return responseUtils.sendError('An error occurred', 500, res);
                    return responseUtils.sendSuccess(true, res);
                });
            });

        });

    return router;
};

