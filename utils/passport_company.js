var LocalStrategy = require('passport-local').Strategy,
    Company = require('../models/company'),
    companyFunctions = require('../utils/company');


var exports = module.exports;

/**
 * Company Signup Strategy
 */
exports.CompanySignupStrategy = new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, function (req, email, password, done) {
    process.nextTick(function () {
        Company.findOne({'email': email}).exec().then(function (company) {
            if (company) {
                return done({message: 'business with that email already exists', status: 409}, false);
            }
            var newCompany = new Company(req.body);
            if (!newCompany.validatePassword(req.body.password)) {
                return done({
                    success: false,
                    message: "password not valid"
                }, false);
            }
            newCompany.password = newCompany.generateHash(newCompany.password);
            newCompany.save().then(function (savedCompany) {
                if (!req.body.company_logo_data) {
                    return done(null, savedCompany);
                } else {
                    companyFunctions.uploadMedia(req.body.company_logo_data, 'company_logos', 'jpg',
                        'company_logo', savedCompany, function () {
                            return done(null, savedCompany);
                        });
                }
            }).catch(function (saveError) {
                return done({message: saveError.message, status: 400, errors: saveError.errors}, false);
            });
        }).catch(function (err) {
            return done({message: err.message, status: 500}, false);
        });
    });
});

/**
 * Company Login Strategy
 */
exports.CompanyLoginStrategy = new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, function (req, email, password, done) {
    process.nextTick(function () {
        Company.findOne({'email': email}, '+password').then(function (company) {
            if (!company)
                return done({
                    message: 'No company found.',
                    status: 404
                }, false);
            if (!company.comparePassword(password))
                return done({
                    message: 'Oops! Wrong password.',
                    status: 400
                }, false);
            return done(null, company);
        }).catch(function (error) {
            return done(error, false);
        });
    });
});