var nodemailer = require('./../utils/node_mailer');

var exports = module.exports = {};

exports.sendVerificationEmail = function (verificationUrl, company, from) {
    nodemailer.send('88c9c6c8-dbc1-4834-8488-0e5131d52761', 'Welcome to the Releaf Family!', company.email, from, {
        '%verification_url%': verificationUrl,
        '%name%': company.business_name
    });
};

exports.sendPasswordResetEmail = function (company, resetLink, from) {
    nodemailer.send('04697caf-b447-4210-806f-5bb3383c991a', 'Reset your Password', company.email, from, {
        '%firstname%': company.business_name,
        '%link%': resetLink
    });
};