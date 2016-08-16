var database = process.env.MONGODB_URI || 'mongodb://localhost/first_test_db';
var superSecret = '';
var mocha_database = 'mongodb://localhost/mocha_test_db';
module.exports = {"database":database, "superSecret": superSecret, "mocha_database": mocha_database};
