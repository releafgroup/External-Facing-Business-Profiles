var express = require('express');
var router = express.Router();
var User = require('../models/user');
var Company = require('../models/company');
var responseUtils = require('../helpers/response');
var volunteerEmails = require('../emails/volunteer');
var companyEmails = require('../emails/company');
var companyUtils = require('../utils/company');
var config = require('../config');


/**
 * Sends password reset email
 */
router.route('/reset/email')
    .post(function (req, res) {
        var email = req.body.email;

        User.findOne({'local.email': email}, function (err, user) {

            if (err) return responseUtils.sendError('An error occurred', 500, res);

            if (!user) {
                return companyUtils.handleCompanyPasswordReset(email, res);
            }

            volunteerEmails.sendPasswordResetEmail(user, config.feBaseUrl + '/forgotpassword/' +
                user.getPasswordResetToken(), "Releaf <noreply@releaf.ng>");

            return responseUtils.sendSuccess(true, res);
        });

    });

/**
 * Verify reset token
 */
router.route('/reset/token/verify')
    .post(function (req, res) {
        var token = req.body.token;

        User.findOne({'password_reset_token': token}, function (err, user) {

            if (err) return responseUtils.sendError('An error occurred', 500, res);

            if (!user) {
                return companyUtils.handleCompanyVerifyToken(token, res);
            }

            return responseUtils.sendSuccess(true, res);
        });

    });

/**
 * Verify reset token
 */
router.route('/change')
    .post(function (req, res) {
        var token = req.body.token;
        var newPassword = req.body.password;

        User.findOne({'password_reset_token': token}, function (err, user) {

            if (err) return responseUtils.sendError('An error occurred', 500, res);

            if (!user) {
                return companyUtils.handleCompanyChangePassword(token, newPassword, res);
            }

            user.local.password = user.generateHash(newPassword);
            user.password_reset_token = null;

            user.save(function (err) {
                if (err) return responseUtils.sendError('An error occurred', 500, res);
                return responseUtils.sendSuccess(true, res);
            });
        });

    });

module.exports = router;

