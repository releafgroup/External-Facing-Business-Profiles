var EmailTemplates = require('swig-email-templates');
var nodemailer = require('./../utils/node_mailer');

var exports = module.exports = {};

var templates = new EmailTemplates({
    root: './emails/templates'
});

exports.sendVerificationEmail = function (verificationUrl, to, from) {
    templates.render('business_email_verification.html', {verification_url: verificationUrl}, function (err, html) {
        nodemailer.send('Welcome to the Releaf Family!', html, to, from);
    })
};

exports.sendPasswordResetEmail = function (company, resetLink, from) {
    templates.render('password_reset.html', {
        firstname: company.business_name,
        link: resetLink
    }, function (err, html) {
        nodemailer.send('Releaf - Reset your Password', html, company.email, from);
    })
};