
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
// create reusable transporter object using SMTP transport

var transporter;
exports.setupTransport = function(mailConfig) {
    transporter = nodemailer.createTransport(mailConfig);
}
// NB! No need to recreate the transporter object. You can use
// the same transporter object for all e-mails

// setup e-mail data with unicode symbols
//var mailOptions = {
//    from: 'Fred Foo ✔ <foo@blurdybloop.com>', // sender address
//    to: 'bar@blurdybloop.com, baz@blurdybloop.com', // list of receivers
//    subject: 'Hello ✔', // Subject line
//    text: 'Hello world ✔', // plaintext body
//    html: '<b>Hello world ✔</b>' // html body
//};
function setHeaders(mailOptions) {
    mailOptions.headers = {
        "Content-Type": "text/html",
      //  from: mailOptions.from, // sender address.  Must be the same as authenticated user if using GMail.
        //to: mailOptions.to, // receiver
        //subject: mailOptions.subject, // subject
    };
     
    return mailOptions;
}

// send mail with defined transport object
var sendMail = function(mailOptions) {
    mailOptions = setHeaders(mailOptions);
    transporter.sendMail(mailOptions, function(error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Message sent: ' + info.response);
            console.log('Options: ', mailOptions);
        }
        transporter.close();
    });
}
exports.sendMail = sendMail;
        