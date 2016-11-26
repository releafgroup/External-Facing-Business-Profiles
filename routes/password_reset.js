var express = require('express');
var router = express.Router();
var User = require('../models/user');
var Company = require('../models/company');
var responseUtils = require('../helpers/response');
var volunteerEmails = require('../emails/volunteer');
var companyEmails = require('../emails/company');
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
                return handleCompanyPasswordReset(email, res);
            }

            volunteerEmails.sendPasswordResetEmail(user, config.feBaseUrl + '/password/reset?token=' +
                user.getPasswordResetToken(), "Releaf <noreply@releaf.ng>");

            return responseUtils.sendSuccess(true, res);
        });

    });


function handleCompanyPasswordReset(email, res) {
    Company.findOne({'email': email}, function (err, company) {
        if (err) return responseUtils.sendError('An error occurred', 500, res);

        if (!company) return responseUtils.sendError('User not found', 400, res);

        companyEmails.sendPasswordResetEmail(company, config.feBaseUrl + '/password/reset?token=' +
                company.getPasswordResetToken(), "Releaf <noreply@releaf.ng>");

        return responseUtils.sendSuccess(true, res);
    });
}

/**
 * Verify reset token
 */
router.route('/reset/token/verify')
    .post(function (req, res) {
        var token = req.body.token;

        User.findOne({'password_reset_token': token}, function (err, user) {

            if (err) return responseUtils.sendError('An error occurred', 500, res);

            if (!user) {
                return handleCompanyVerifyToken(token, res);
            }

            return responseUtils.sendSuccess(true, res);
        });

    });

function handleCompanyVerifyToken(token, res) {
    Company.findOne({'password_reset_token': token}, function (err, company) {
        if (err) return responseUtils.sendError('An error occurred', 500, res);

        if (!company) return responseUtils.sendError('Invalid Token', 400, res);

        return responseUtils.sendSuccess(true, res);
    });
}

/**
 * Verify reset token
 */
router.route('/password/change')
    .post(function (req, res) {
        var token = req.body.reset_token;
        var newPassword = req.body.password;

        User.findOne({'password_reset_token': token}, function (err, user) {

            if (err) return responseUtils.sendError('An error occurred', 500, res);

            if (!user) {
                return handleCompanyChangePassword(token, newPassword, res);
            }

            user.password = user.generateHash(newPassword);

            user.save(function (err) {
                if(err) return responseUtils.sendError('An error occurred', 500, res);
                return responseUtils.sendSuccess(true, res);
            });
        });

    });

function handleCompanyChangePassword(token, newPassword, res) {
    Company.findOne({'password_reset_token': token}, function (err, company) {
        if (err) return responseUtils.sendError('An error occurred', 500, res);

        if (!company) return responseUtils.sendError('Invalid Reset Token', 400, res);

        company.password = company.generateHash(newPassword);

        company.save(function (err) {
            if(err) return responseUtils.sendError('An error occurred', 500, res);
            return responseUtils.sendSuccess(true, res);
        });
    });
}



module.exports = router;

