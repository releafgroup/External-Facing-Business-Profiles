var EmailTemplates = require('swig-email-templates');
var nodemailer = require('./../utils/node_mailer');

var exports = module.exports = {};

var templates = new EmailTemplates({
    root: './emails/templates'
});

exports.sendVerificationEmail = function (verificationUrl, to, from) {
    templates.render('business_email_verification.html', {verification_url: verificationUrl}, function (err, html) {
        send('Welcome to the Releaf Family!', html, to, from)
    })
};

function send(subject, html, to, from) {
    nodemailer.sendMail({
        from: from,
        to: to,
        subject: subject,
        html: html
    });
}