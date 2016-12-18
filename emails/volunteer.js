var nodemailer = require('./../utils/node_mailer');

var exports = module.exports = {};

exports.sendVerificationEmail = function (verificationUrl, user, from) {
    nodemailer.send('0be907b6-c270-4adc-8374-cec09e0c4228', 'Welcome to the Releaf Family!', user.local.email, from, {
        '%verification_url%': verificationUrl,
        '%name%': user.first_name
    });
};

exports.sendPasswordResetEmail = function (user, link, from) {
    nodemailer.send('04697caf-b447-4210-806f-5bb3383c991a', 'Password Reset', user.local.email, from, {
        '%firstname%': user.first_name,
        '%link%': link
    });
};