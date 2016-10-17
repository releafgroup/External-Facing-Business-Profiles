require('dotenv').config();

var database = process.env.MONGODB_URI || 'mongodb://localhost/first_test_db';
var superSecret = '';
var mocha_database = 'mongodb://localhost/mocha_test_db';
module.exports = {"database":database, "superSecret": superSecret, "mocha_database": mocha_database};

module.exports.mailConfig = {
    smtp: {
        service: 'gmail',
        auth: {
            user: 'tester0715@gmail.com',
            pass: 'TesterMustak0715'
        }
    },
    sendingEmailFrom: {
      name:"Releaf Group",
      email:"tester0715@gmail.com"
    },
    spanHours : 4//how many hours span we sent unread messages to users
};