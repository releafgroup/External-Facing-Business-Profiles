require('dotenv').config();

var AWS = require('aws-sdk');
// Loads the environment variables from the dotenv file

var s3Bucket = new AWS.S3({params: {Bucket: 'ikeora-v2'}});

var exports = module.exports = {};

exports.upload = function (data, cb) {
    s3Bucket.putObject(data, cb);
};

/**
 * Gets the image url from the
 * @param filename
 * @returns {string}
 */
exports.getUrl = function (filename) {
    return 'https://s3-eu-west-1.amazonaws.com/ikeora-v2/' + filename;
};