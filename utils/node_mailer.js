var config = require('./../config');
var nodemailer = require('nodemailer');
// create reusable transporter object using SMTP transport

var transporter;
exports.setupTransport = function (mailConfig) {
    transporter = nodemailer.createTransport(mailConfig);
};

/**
 * from: mailOptions.from, // sender address.  Must be the same as authenticated user if using GMail.
 * to: mailOptions.to, // receiver
 * subject: mailOptions.subject, // subject
 * @param mailOptions
 * @returns {*}
 */
function setHeaders(mailOptions) {
    mailOptions.headers = {
        "Content-Type": "text/html"
    };

    return mailOptions;
}

// send mail with defined transport object
exports.sendMail = function (mailOptions) {
    mailOptions = setHeaders(mailOptions);

    if (typeof transporter == 'undefined') {
        this.setupTransport(config.mailConfig.smtp);
    }

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Message sent: ' + info.response);
        }
    });
};

/**
 * Send email
 * @param subject
 * @param html
 * @param to
 * @param from
 */
exports.send = function send(subject, html, to, from) {
    exports.sendMail({
        from: from,
        to: to,
        subject: subject,
        html: html
    });
};
        