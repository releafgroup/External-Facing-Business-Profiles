var config = require('../config.js');
var MongoClient = require('mongodb').MongoClient;

module.exports = function execute(callback) {
    MongoClient.connect(config.database, callback);
};