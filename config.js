
var database = process.env.MONGODB_URI || 'mongodb://localhost/first_test_db';

var superSecret = '';
var mocha_database = 'mongodb://localhost/mocha_test_db';
module.exports = {"database":database, "superSecret": superSecret, "mocha_database": mocha_database};

module.exports.mailConfig = {
    smtp: {
  
       // host: 'smtp.gmail.com',
       // secureConnection: true,
       // pool:true,
        port: 25,
        service: 'gmail',
        auth: {
            user: 'tester0715@gmail.com',
            pass: 'TesterMustak0715'
        }
    }
   
}