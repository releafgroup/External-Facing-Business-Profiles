var request = require('supertest');
var mongoose = require('mongoose');
var config = require('../config.js');
var testHelpers = require('../helpers/test');
var should = require('should');

var company1 = testHelpers.company1();
var company1Id = -1;
var url = testHelpers.url;
var loginRequest = request.agent(url);

describe('Company routes', function () {
    before(function (done) {
        // Use mocha test db
        mongoose.connect(config.mocha_database, function () {
            /* Drop the DB */
            mongoose.connection.db.dropDatabase();
        });
        done();
    });

    describe('Business Sign Up and Login', function () {
        it('tests that business with invalid contact phone number cannot signup ', function (done) {
            company1.primary_contact_phone = 'lorem ipsum';
            request(url)
                .post('/companies/auth/signup')
                .send(company1)
                .expect(400) //Status code
                .end(function (err, res) {
                    res.body.success.should.equal(false);
                    done();
                });
        });

        it('tests that business cannot signup with same industry', function (done) {
            company1 = testHelpers.company1();
            var badCompany = Object.assign(company1, {});
            badCompany.company_industry = ['Storage', 'Storage'];
            request(url)
                .post('/companies/auth/signup')
                .send(badCompany)
                .expect(400) //Status code
                .end(function (err, res) {
                    res.body.success.should.equal(false);
                    done();
                });
        });

        it('tests that business can signup', function (done) {
            company1 = testHelpers.company1();
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
            loginRequest.post('/companies/auth/login')
                .send(company1)
                .expect(200)
                .end(function (err, res) {
                    res.body.success.should.equal(true);
                    res.body.message.should.equal(company1Id);
                    done();
                });
        });

        it('tests can get business data after login', function (done) {
            loginRequest.get('/companies/')
                .expect(200)
                .end(function (err, newRes) {
                    newRes.body.success.should.equal(true);
                    newRes.body.message._id.should.equal(company1Id);
                    done();
                });
        });

        it('tests can update business data after login', function (done) {
            var newCompanyPurpose = "the purpose is to test if the creation works";
            loginRequest.put('/companies/')
                .expect(200)
                .send({
                    "company_purpose": newCompanyPurpose
                })
                .end(function (err, newRes) {
                    newRes.body.success.should.equal(true);
                    loginRequest.get('/companies/')
                        .expect(200)
                        .end(function (err, newRes) {
                            newRes.body.success.should.equal(true);
                            newRes.body.message.company_purpose.should.equal(newCompanyPurpose);
                            done();
                        });
                });
        });

        it('tests that business can logout', function (done) {
            loginRequest.get('/companies/auth/logout')
                .expect(200)
                .end(function (err, res) {
                    res.body.success.should.equal(true);
                    done();
                });
        });

        it('tests that business can signup with logo', function (done) {
            this.timeout(10000);
            company1 = Object.assign({company_logo_data: '123456789'}, testHelpers.company1());
            request(url)
                .post('/companies/auth/signup')
                .send(company1)
                .end(function (err, res) {
                    res.body.success.should.equal(true);
                    var id = res.body.message;
                    request(url).get('/companies/' + id)
                        .end(function (getErr, getRes) {
                            getRes.body.success.should.equal(true);
                            should.exist(getRes.body.message.company_logo);
                            getRes.body.message.company_logo.should.endWith('jpg');
                            done();
                        });
                });
        });
    });
});
