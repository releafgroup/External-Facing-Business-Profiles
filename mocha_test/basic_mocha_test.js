var should = require('should');
var assert = require('assert');
var request = require('supertest');
var mongoose = require('mongoose');
var config = require('../config.js');
var testHelpers = require('../helpers/test');
var server = require('../bin/www');

describe('Routing', function () {
    var url = testHelpers.url;
    before(function (done) {
        // Use mocha test db
        mongoose.connect(config.mocha_database, function () {
            /* Drop the DB */
            mongoose.connection.db.dropDatabase();
        });
        done();
    });

    describe('Basic', function () {
        it('tests if can access main page', function (done) {
            request(url)
                .get('/')
                .end(function (err, res) {
                    if (err) {
                        throw err;
                    }
                    res.body.title.should.equal('Welcome to the ikeora API');
                    done();
                });
        });
    });
});
