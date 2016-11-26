var express = require('express');
var router = express.Router();
var User = require('../models/user');
var Company = require('../models/company');
var responseUtils = require('../helpers/response');
var volunteerEmails = require('../emails/volunteer');
var companyEmails = require('../emails/company');
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

        companyEmails.sendPasswordResetEmail(company, config.feBaseUrl + '/password/reset?token=' +
                company.getPasswordResetToken(), "Releaf <noreply@releaf.ng>");

        return responseUtils.sendSuccess(true, res);
    });
}


module.exports = router;

