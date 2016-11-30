var request = require('supertest');
var mongoose = require('mongoose');
var config = require('../config.js');
var testHelpers = require('../helpers/test');
var should = require('should');
var Company = require('../models/company.js');
var messages = require('../libs/messages');

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

        it('Fail Case: Try to verify email with invalid token', function (done) {
            request.agent(url)
                .post('/companies/email/verify')
                .send({token: 'invalid token'})
                .expect(400)
                .end(function (err, res) {
                    res.body.success.should.equal(false);
                    res.body.message.should.equal(messages.INVALID_EMAIL_VERIFICATION_TOKEN);
                    done();
                });
        });

        it('Success Case: Verify email with valid token', function (done) {
            Company.findOne({'_id': company1Id}, function (err, company) {
                if(err) done(err);
                if(!company) done('Company not found');
                request.agent(url)
                    .post('/companies/email/verify')
                    .send({token: company.email_verification_token})
                    .expect(200)
                    .end(function (err, res) {
                        res.body.success.should.equal(true);
                        done();
                    });
            });
        });

        it('Success Case: Resend Verification Email', function (done) {
            Company.findOne({'_id': company1Id}, function (err, company) {
                if(err) done(err);
                if(!company) done('Company not found');
                request.agent(url)
                    .post('/companies/email/verify/resend')
                    .send({email: company.email})
                    .expect(200)
                    .end(function (err, res) {
                        res.body.success.should.equal(true);
                        done();
                    });
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

        describe('Password Reset', function () {
            it('Send password reset email to company', function (done) {
                request(url)
                    .post('/password/reset/email')
                    .send({email: company1['email']})
                    .expect(200)
                    .end(function (err, res) {
                        res.body.success.should.equal(true);
                        done();
                    });
            });


            it('Fail Case: Verify invalid token', function (done) {
                request(url)
                    .post('/companies/password/reset/token/verify')
                    .send({token: 'invalid token'})
                    .expect(400)
                    .end(function (err, res) {
                        res.body.success.should.equal(false);
                        done();
                    });
            });

            it('Success Case: Verify reset token', function (done) {
                Company.findOne({'_id': company1Id}, function (err, company) {
                    if(err) done(err);
                    if(!company) done('Company not found');
                    request.agent(url)
                        .post('/companies/password/reset/token/verify')
                        .send({token: company.password_reset_token})
                        .expect(200)
                        .end(function (err, res) {
                            res.body.success.should.equal(true);
                            done();
                        });
                });
            });

            it('Success Case: Change Password', function (done) {
                console.log(company1);
                Company.findOne({'_id': company1Id}, function (err, company) {
                    company1 = company;
                    if(err) done(err);
                    if(!company) done('Company not found');
                    request.agent(url)
                        .post('/companies/password/change')
                        .send({token: company.password_reset_token, password: 'Abcd123456'})
                        .expect(200)
                        .end(function (err, res) {
                            res.body.success.should.equal(true);
                            done();
                        });
                });
            });

            it('logs in with new password', function (done) {
                request.agent(url).post('/companies/auth/login')
                    .send({email:company1['email'], password: 'Abcd123456'})
                    .expect(200)
                    .end(function (err, res) {
                        res.body.success.should.equal(true);
                        res.body.message.should.equal(company1Id);
                        done();
                    });

            });
        });


    });
});
