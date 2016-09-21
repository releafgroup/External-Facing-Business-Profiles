var should = require('should');
var assert = require('assert');
var request = require('supertest');
var mongoose = require('mongoose');
var config = require('../config.js');
var testHelpers = require('../helpers/test');
var server = require('../bin/www');

var company1Id = -1;
var company1 = testHelpers.company1;

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

    describe('Company Sign Up', function () {
        it('creates company 1', function (done) {
            request(url)
                .post('/companies')
                .send(company1)
                .expect(200) //Status code
                .end(function (err, res) {
                    company1Id = res.body.id;
                    res.body.success.should.equal(true);
                    done();
                });
        });

        it('tests can get company 1 info', function (done) {
            request(url)
                .get('/companies/' + company1Id)
                .expect(200) //Status code
                .end(function (err, res) {
                    res.body.success.should.equal(true);
                    done();
                });
        });

    });
});
