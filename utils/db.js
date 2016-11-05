var MongoClient = require('mongodb').MongoClient;
var URI = process.env.MONGODB_URI || 'mongodb://localhost/first_test_db';

module.exports = function execute(callback) {
    MongoClient.connect(URI, callback);
};