var EmailTemplates = require('swig-email-templates');
var nodemailer = require('./../utils/node_mailer');

var exports = module.exports = {};

var templates = new EmailTemplates({
    root: './emails/templates'
});

exports.sendVerificationEmail = function (verificationUrl, to, from) {
    templates.render('volunteer_email_verification.html', {verification_url: verificationUrl}, function (err, html) {
        nodemailer.send('Welcome to the Releaf Family!', html, to, from);
    })
};

exports.sendPasswordResetEmail = function (user, link, from) {
    templates.render('password_reset.html', {'firstname': user.first_name, 'link': link}, function (err, html) {
        //TODO: Confirm email subject
        nodemailer.send('Password Reset', html, user.local.email, from);
    });
};