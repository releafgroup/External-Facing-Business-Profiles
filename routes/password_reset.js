var express = require('express');
var router = express.Router();
var User = require('../models/user');
var Company = require('../models/company');
var responseUtils = require('../helpers/response');
var volunteerEmails = require('../emails/volunteer');
var config = require('../config');


/**
 *
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

        //TODO Get Password reset token for company - add this in Company Schema
        //TODO Add company sendPasswordResetEmail to emails/company.js
        //TODO send email reset password email to company
        //TODO Send Success Response
        //TODO Add test for company password reset
    });
}


module.exports = router;

