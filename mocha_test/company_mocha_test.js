var should = require('should');
var assert = require('assert');
var request = require('supertest');
var mongoose = require('mongoose');
var config = require('../config.js');
var testHelpers = require('../helpers/test');
var faker = require('faker');

var company1 = testHelpers.company1();
var company1Id = -1;
var companyEmail = company1.email;
describe('Company routes', function () {
    var url = testHelpers.url;
    before(function (done) {
        // Use mocha test db
        mongoose.connect(config.mocha_database, function () {
            /* Drop the DB */
            mongoose.connection.db.dropDatabase();
        });
        done();
    });

    describe('Business Sign Up and Login', function () {
        it('tests that business can signup', function (done) {
            request(url)
                .post('/companies/auth/signup')
                .send(company1)
                .expect(200) //Status code
                .end(function (err, res) {
                    company1Id = res.body.message;
                    res.body.success.should.equal(true);
                    done();
                });
        });

        it('tests that business can login', function (done) {
            request(url).post('/companies/auth/login')
                .send(company1)
                .expect(200)
                .end(function (err, res) {
                    res.body.success.should.equal(true);
                    res.body.message.should.equal(company1Id);
                    done();
                });
        });

        it('tests that business can logout', function (done) {
            request(url).get('/companies/auth/logout')
                .expect(200)
                .end(function (err, res) {
                    res.body.success.should.equal(true);
                    done();
                });
        });
    });
});