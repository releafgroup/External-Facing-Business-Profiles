var express = require('express');
var router = express.Router();
var Company = require('../models/company');
var bcrypt = require('bcryptjs');
var companyFunctions = require('../utils/company');
var projectFunctions = require('../utils/project');
var permissionHelper = require('../helpers/permission');

var isLoggedIn = permissionHelper.isLoggedIn;
var checkBusinessProfilePermission = permissionHelper.checkBusinessProfilePermission;


// Function for company error handling in saving company info
function handleCompanySaveError(err) {
    // Check if business name already exists
    if (err.code == 11000) {
        err.message = "A company with that business name already exists";
    } else {
        // If company validation, gets one of the errors to return
        if (err.message == "Company validation failed") {
            var one_error;
            for (var first in err.errors) { // Get one of the errors
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

module.exports = function (passport) {
    /**
     * Logout route
     */
    router.route('/auth/logout').get(function (req, res) {
        req.logout();
        return res.json({success: true, message: 'logged out'});
    });

    /**
     * Login route
     */
    router.route('/auth/login').post(passport.authenticate('company-login', {}), function (req, res) {
        return res.json({success: true, message: req.user._id});
    });

    /**
     * Signup route
     */
    router.route('/auth/signup').post(passport.authenticate('company-signup', {}), function (req, res) {
        return res.json({success: true, message: req.user._id});
    });

    router.route('/').post(function (req, res) {
        var company = new Company();
        // Populate Information
        for (var a in req.body) {
            if (a != "password") {
                company[a] = req.body[a];
            } else {
                if (req.body.password.length < 8 || req.body.password.length > 64) {
                    return res.json({success: false, message: 'password does not fit the required length'});
                }
                company.password = bcrypt.hashSync(req.body.password, 10);
            }
        }
        company.save(function (err, company) {
            if (err) {
                return res.json({success: false, message: handleCompanySaveError(err)});
            }
            return res.json({id: company.id, success: true}); // Returns company id
        });
    });

    /**
     * GET - Gets the logged in business
     * PUT - Updates the logged in business
     */
    router.route('/')
        .get(isLoggedIn, function (req, res) {
            if (!checkBusinessProfilePermission(req, res)) return res.json({success: false, message: 'No permission'});
            return companyFunctions.getCompanyById(req.session.passport.user.id, req, res);
        })
        .put(isLoggedIn, function (req, res) {
            if (!checkBusinessProfilePermission(req, res)) return res.json({success: false, message: 'No permission'});
            return companyFunctions.updateCompanyById(req.session.passport.user.id, req, res);
        });

    router.route('/:id').get(function (req, res) {
        return companyFunctions.getCompanyById(req.params.id, req, res);
    }).put(function (req, res) {
        return companyFunctions.updateCompanyById(req.params.id, req, res);
    });

    /**
     * Get company projects
     */
    router.route('/:id/projects').get(function (req, res) {
        return projectFunctions.getAllCompanyProjects(req.params.id, req, res);
    });

    /** Route: /companies/email/verify
     * Verifies company's email
     * 'token' must be passed in the req body
     */
    router.route('/email/verify')
        .post(function (req, res) {
            return companyFunctions.verifyEmail(req.body.token, req, res);
        });

    /** Route: /companies/email/verify/resend
     * Resend verification email to company
     * 'email' must be passed in the req body
     */
    router.route('/email/verify/resend')
        .post(function (req, res) {
            return companyFunctions.resendVerificationEmail(req.body.email, req, res);
        });


    /** Route: /companies/password/reset/email
     * Sends password reset email
     * 'email' must be passed in req body
     */
    router.route('/password/reset/email')
        .post(function (req, res) {
            return companyFunctions.handleCompanyPasswordReset(req.body.email, res);
        });

    /** Route: /companies/password/reset/token/verify
     * Verify reset token
     * 'token' must be passed in req body
     */
    router.route('/password/reset/token/verify')
        .post(function (req, res) {
            return companyFunctions.handleCompanyVerifyToken(req.body.token, res);

        });

    /** Route: /companies/password/change
     * Verify reset token
     */
    router.route('/password/change')
        .post(function (req, res) {
            return companyFunctions.handleCompanyChangePassword(req.body.token, req.body.password, res);
        });


    return router;
};