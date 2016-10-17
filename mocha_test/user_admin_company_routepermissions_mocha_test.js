var should = require('should');
var request = require('supertest');
var mongoose = require('mongoose');
var config = require('../config.js');
var faker = require('faker');
var testHelpers = require('../helpers/test');
var User = require('../models/user.js');
require('../bin/www');

var url = testHelpers.url;

var superAgentAdmin = (require('supertest')).agent(url);
var admin1 = {
    'name': 'admin1@gmail.com',
    'password': 'admin1'
};

var superAgent = request.agent(url);
var user1 = testHelpers.user1;
var token = null;
var user1Id = -1;

describe('Routing', function () {
    before(function (done) {
        // Use mocha test db
        mongoose.connect(config.mocha_database, function () {
            /* Drop the DB */
            mongoose.connection.db.dropDatabase();
        });
        done();
    });

    describe('Creates admin + regular user', function () {
        it('creates admin 1', function (done) {
            superAgentAdmin
                .post('/admin')
                .send(admin1)
                .expect(200)
                .end(function (err, res) {
                    admin1['_id'] = res.body.message;
                    res.body.success.should.equal(true);
                    done();
                });

        });

        it('tries to login admin 1', function (done) {
            superAgentAdmin
                .post('/admin/auth/login')
                .send(admin1)
                .end(function (err, res) {
                    res.body.success.should.equal(true);
                    done();
                });

        });

        it('creates user 1', function (done) {
            superAgent
                .post('/users/auth/signup')
                .send(user1)
                .expect(200) //Status code
                .end(function (err, res) {
                    user1Id = res.body.message;
                    res.body.success.should.equal(true);
                    done();
                });
        });

        it('Fail Case: Create user with existing email', function (done) {
            request.agent(url)
                .post('/users/auth/signup')
                .send(user1)
                .expect(409) //Status code
                .end(function (err, res) {
                    res.body.success.should.equal(false);
                    done();
                });
        });


        it('Fail Case: Try to verify email with invalid token', function (done) {
            request.agent(url)
                .post('/users/email/verify')
                .send({token: 'invalid token'})
                .expect(400)
                .end(function (err, res) {
                    res.body.success.should.equal(false);
                    res.body.message.should.equal('invalid verification token');
                    done();
                });
        });

        it('Success Case: Verify email with valid token', function (done) {
            User.findOne({'_id': user1Id}, function (err, user) {
                if(err) done(err);
                if(!user) done('User not found');
                request.agent(url)
                    .post('/users/email/verify')
                    .send({token: user.email_verification_token})
                    .expect(400)
                    .end(function (err, res) {
                        res.body.success.should.equal(true);
                        done();
                    });
            });
        });

        it('Success Case: Resend Verification Email', function (done) {
            User.findOne({'_id': user1Id}, function (err, user) {
                if(err) done(err);
                if(!user) done('Company not found');
                request.agent(url)
                    .post('/users/email/verify/resend')
                    .send({email: user.local.email})
                    .expect(200)
                    .end(function (err, res) {
                        res.body.success.should.equal(true);
                        done();
                    });
            });
        });

        it('Success: User 1 login', function (done) {
            superAgent
                .post('/users/auth/login')
                .send(user1)
                .expect(200) //Status code
                .end(function (err, res) {
                    res.body.success.should.equal(true);
                    token = res.body.message;
                    done();
                });
        });

        it('Success: Password is not in user object', function (done) {
            superAgent
                .get('/users')
                .expect(200) //Status code
                .end(function (err, res) {
                    should.not.exist(res.body.message.local.password);
                    done();
                });
        });

        it('Success: Update firstname and lastname of user', function (done) {
            var firstname = faker.name.firstName();
            var lastname = faker.name.lastName();
            var userUrl = '/users?token=' + token;
            superAgent.put(userUrl)
                .send({
                    'local.first_name': firstname,
                    'local.last_name': lastname
                })
                .expect(200)
                .end(function (err, res) {
                    res.body.success.should.equal(true);
                    superAgent.get(userUrl)
                        .expect(200)
                        .end(function (newErr, newRes) {
                            newRes.body.message.local.first_name.should.equal(firstname);
                            newRes.body.message.local.last_name.should.equal(lastname);
                            done();
                        });
                });
        });
    });

    describe('Checks Permissions', function () {
        it('checks that user 1 cannot access admin 1 routes', function (done) {
            superAgent
                .get('/admin/volunteers')
                .end(function (err, res) {
                    res.body.success.should.not.equal(true);
                    done();
                });

        });

        it('checks that admin 1 cannot access user 1 routes', function (done) {
            superAgentAdmin
                .get('/users')
                .end(function (err, res) {
                    res.body.success.should.not.equal(true);
                    done();
                });

        });

    });
});
