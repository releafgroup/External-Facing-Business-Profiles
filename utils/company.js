var Company = require('../models/company.js');
var awsS3 = require('../helpers/aws_s3');
var base64Utils = require('../helpers/base_64');
var responseUtils = require('../helpers/response');
var companyEmails = require('../emails/company');
var config = require('../config');
var messages = require('../libs/messages');

/** Function for user error handling in saving company info
 * @params: error from saving a company
 * Output: parsed error message
 */
function handleCompanySaveError(err) {
    // Check if business name already exists
    if (err.code == 11000) {
        err.message = "A company with that business name already exists";
    } else {
        // If company validation, gets one of the errors to return
        if (err.message == "Company validation failed") {
            var one_error;
            for (first in err.errors) { // Get one of the errors
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

var exports = module.exports = {};


/** Gets information for given Company id
 * @params: company_id, req, res
 * Output: If successful, {success: true, message : company_info}
 * If not, {success: false, message: error_message}
 * Possible errors are: User not found and networking issues
 */
exports.getCompanyById = function (company_id, req, res) {
    Company.findOne({
        '_id': company_id
    }, function (err, company) {
        if (!company) return res.json({success: false, message: 'Company not found'});
        if (err) return res.json({success: false, message: err.message});
        return res.json({success: true, message: company});
    });
};

/** Updates information for given Company id
 * @params: company_id, req, res
 * Output: If successful, {success: true}
 * If not, {success: false, message: error_message}
 * Possible errors are attempting to modify the business name or company_id and deleting a required element
 */
exports.updateCompanyById = function (company_id, req, res) {
    Company.findOne({
        '_id': company_id
    }, function (err, company) {
        if (!company) return res.json({success: false, message: 'Company not found'});
        if (err) return res.json({success: false, message: err.message});
        for (a in req.body) {
            if (a != "id" && a != "business_name" && a != "_id") {
                company[a] = req.body[a];
                if (a == "password") {
                    company.password = bcrypt.hashSync(req.body.password, 10);
                }
            } else if (a == "business_name") {
                if (req.body[a] != company[a]) return res.json({
                    success: false,
                    message: "You cannot modify the business name"
                });
            } else {
                if (company[a] != req.body[a]) return res.json({success: false, message: "You cannot modify the id"});
            }
        }
        company.save(function (err) {
            if (err) {
                return res.json({success: false, message: handleCompanySaveError(err)});
            }
            return res.json({success: true});
        });
    });
};

/** Gets all Companies
 * @params: req, res
 * Output: If successful, {success: true, message: list_of_companies}
 * If not, {success: false, message: error_message}
 */
exports.getAllCompanies = function (req, res) {

    Company.find(function (err, companies) {
        if (err) return res.json({success: false, message: err.message});
        res.json({success: true, message: companies});
    });
};

exports.uploadMedia = function (data, folderName, extension, field, newCompany, successCallback) {
    // TODO Handle upload failures
    var file = data;
    var mimeType = base64Utils.getMimeType(file);

    var buf = new Buffer(base64Utils.getData(file), 'base64');
    var environment = process.env.APPLICATION_ENV;
    var filename = environment + '/' + folderName + '/' + newCompany._id + '.' + extension;

    awsS3.upload({
        Key: filename,
        Body: buf,
        ContentEncoding: 'base64',
        ContentType: mimeType,
        ACL: 'public-read'
    }, function (err) {
        if (!err) {
            newCompany[field] = awsS3.getUrl(filename);
            newCompany.save().then(function () {
                successCallback();
            });
        } else {
            successCallback();
        }
    });
};

/**
 *
 * @param company Company
 * @todo Reuse implementation in users
 */
exports.sendVerificationEmail = function (company) {
    var token = company.getEmailVerificationToken();
    if (!config.featureToggles.isFeatureEnabled('emailVerification')) return;
    companyEmails.sendVerificationEmail(
        config.feBaseUrl + "/business/verify/email?token=" + token,
        company.email,
        "Releaf <noreply@releaf.ng>"
    );
};

/**
 *
 * @param token
 * @param req
 * @param res
 * @todo Reuse implementation in users
 */
exports.verifyEmail = function (token, req, res) {
    Company.findOne({
        'email_verification_token': token
    }, function (err, company) {
        if (err) return responseUtils.sendError(messages.EMAIL_VERIFICATION_ERROR, 500, res);

        if (!company) return responseUtils.sendError(messages.INVALID_EMAIL_VERIFICATION_TOKEN, 400, res);

        if (company.verification_token_expires_at < Date.now()) {
            return responseUtils.sendError(messages.EMAIL_VERIFICATION_TOKEN_EXPIRED, 400, res);
        }

        company.email_verified = true;
        company.verification_token_expires_at = Date.now();
        company.save(function (err) {
            if (err) return responseUtils.sendError(messages.EMAIL_VERIFICATION_ERROR, 500, res);
            return responseUtils.sendSuccess(true, res);
        });
    })
};

/**
 *
 * @param email
 * @param req
 * @param res
 * @todo Reuse implementation in users
 */
exports.resendVerificationEmail = function (email, req, res) {
    Company.findOne({'email': email}, function (err, company) {
        if (err) return responseUtils.sendError('Company not found', 400, res);
        exports.sendVerificationEmail(company);
        return responseUtils.sendSuccess(true, res);
    });
};
