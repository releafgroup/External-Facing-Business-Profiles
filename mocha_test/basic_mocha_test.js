var should = require('should');
var assert = require('assert');
var request = require('supertest');
var mongoose = require('mongoose');
var config = require('../config.js');
var testHelpers = require('../helpers/test');

describe('Routing', function () {
    var url = testHelpers.url;
    before(function (done) {
        // In our tests we use the test db
        mongoose.connect(config.database);
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
