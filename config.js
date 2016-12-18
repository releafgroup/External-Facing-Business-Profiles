var env = require('dotenv').config();
var featureToggles = require('feature-toggles');
var toggles = require('./toggles.json');

var database = process.env.MONGODB_URI || 'mongodb://localhost/first_test_db';
var superSecret = '';
var mocha_database = 'mongodb://localhost/mocha_test_db';
module.exports = {"database":database, "superSecret": superSecret, "mocha_database": mocha_database};

module.exports.mailConfig = {
    smtp: {
        auth: {
            api_user: env.MAILER_SMTP_USER,
            api_key: env.MAILER_SMTP_PASS
        }
    },
    sendgrid_api_key: env.SENDGRID_API_KEY,
    sendingEmailFrom: {
      name:"Releaf Group",
      email:"tester0715@gmail.com"
    },
    spanHours : 4//how many hours span we sent unread messages to users
};

module.exports.feBaseUrl = env.FE_BASE_URL;

featureToggles.load(toggles);

module.exports.featureToggles = featureToggles;