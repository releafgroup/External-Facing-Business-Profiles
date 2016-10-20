var env = require('dotenv').config();

var database = process.env.MONGODB_URI || 'mongodb://localhost/first_test_db';
var superSecret = '';
var mocha_database = 'mongodb://localhost/mocha_test_db';
module.exports = {"database":database, "superSecret": superSecret, "mocha_database": mocha_database};

module.exports.mailConfig = {
    smtp: {
        pool: true,
        host: env.MAILER_HOST,
        port: env.MAILER_PORT,
        auth: {
            user: env.MAILER_SMTP_USER,
            pass: env.MAILER_SMTP_PASS
        }
    },
    sendingEmailFrom: {
      name:"Releaf Group",
      email:"tester0715@gmail.com"
    },
    spanHours : 4//how many hours span we sent unread messages to users
};

module.exports.feBaseUrl = env.FE_BASE_URL;