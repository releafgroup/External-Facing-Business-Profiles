var request = require('supertest');
var mongoose = require('mongoose');
var should = require('should');
var config = require('../config.js');
var url = process.env.HOST_DOMAIN || 'http://localhost:3000';
var testHelpers = require('../helpers/test');
var faker = require('faker');
var User = require('../models/user');

var superAgent = request.agent(url);

var user1 = testHelpers.user1;
var user1Id = -1;

var userWithBadEmail = JSON.parse(JSON.stringify(user1));
userWithBadEmail['local.email'] = "odddddd.com";

var userUpdateInfo = JSON.parse(JSON.stringify(user1));
userUpdateInfo = testHelpers.userUpdateInfo;

var userWithBadId = JSON.parse(JSON.stringify(user1));
userWithBadId['id'] = '122222222';

var project1 = testHelpers.project1;

var project1Id = -1;

var project2 = JSON.parse(JSON.stringify(project1));

var project2Id = -1;

var project3 = JSON.parse(JSON.stringify(project1));

var company1Id = -1;
var company1 = testHelpers.company1();

var company2Id = -1;
var company2 = JSON.parse(JSON.stringify(testHelpers.company1()));

// TODO: add test cases for user permissions
// i.e. companies can't access this, users can't access other users data, etc.
describe('Volunteer Test Cases', function () {
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
                    res.body.title.should.equal('Welcome to the ikeora API');
                    done();
                });
        });

    });

    describe('Volunteer Sign Up', function () {
        it('tests basic sign up of Volunteer', function (done) {

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

        it('tests if user is logged in after sign up', function (done) {
            superAgent
                .get('/users/')
                .expect(200)
                .end(function (err, res) {
                    res.body.success.should.equal(true);
                    done();
                });

        });

        it('tests user log out and that user cant access routes after log out', function (done) {
            superAgent
                .get('/users/auth/logout')
                .expect(200)
                .end(function (err, res) {
                    res.body.success.should.equal(true);
                    superAgent
                        .get('/users/')
                        .end(function (err, res) {
                            res.body.success.should.not.equal(true);
                            done();
                        });
                });


        });

        it('tests logging in user and accessing a route', function (done) {
            superAgent
                .post('/users/auth/login')
                .expect(200)
                .send(user1)
                .end(function (err, res) {
                    res.body.success.should.equal(true);
                    superAgent
                        .get('/users/')
                        .end(function (err, res) {
                            res.body.success.should.equal(true);
                            done();
                        });
                });

        });


        it('tests updating password and all other extra information after initial account creation', function (done) {
            superAgent
                .put('/users/')
                .send(userUpdateInfo)
                .end(function (err2, res2) {
                    res2.body.success.should.equal(true);
                    done();
                });
        });

        it('tests updating resume and profile photo', function (done) {
            this.timeout(10000);
            superAgent
                .put('/users/')
                .send({
                    profile_photo_data: '123456789',
                    resume_data: '123455789',
                    resume_extension: 'docx'
                })
                .end(function (err, res) {
                    res.body.success.should.equal(true);
                    superAgent.get('/users')
                        .end(function (getErr, getRes) {
                            getRes.body.success.should.equal(true);
                            should.exist(getRes.body.message.profile_photo);
                            should.exist(getRes.body.message.resume);
                            getRes.body.message.resume.should.endWith('docx');
                            done();
                        });
                });
        });

        it('tests signup with profile_data and resume', function (done) {
            this.timeout(10000);
            user1['local.email'] = faker.internet.email();
            user1.profile_photo_data = '123456789';
            user1.resume_data = '123455789';
            user1.resume_extension = 'docx';

            var agent = request.agent(url);
            agent.post('/users/auth/signup')
                .send(user1)
                .expect(200) //Status code
                .end(function (err, res) {
                    user1Id = res.body.message;
                    res.body.success.should.equal(true);

                    agent.get('/users')
                        .end(function (getErr, getRes) {
                            getRes.body.success.should.equal(true);
                            should.exist(getRes.body.message.profile_photo);
                            should.exist(getRes.body.message.resume);
                            getRes.body.message.resume.should.endWith(user1.resume_extension);
                            done();
                        });
                });
        });

        after(function () {
            delete user1.resume_extension;
            delete user1.resume_data;
            delete user1.profile_photo_data;
        });
    });


    describe('Volunteer Validation', function () {

        // TODO: change
        it('tests that we check if an email has valid format', function (done) {
            superAgent
                .post('/users/auth/signup')
                .send(userWithBadEmail)
                .expect(200)
                .end(function (err, res) {
                    res.body.success.should.not.equal(true);
                    done();
                });
        });

        it('tests that dob is not above max age', function (done) {
            // change email to ensure failure is not due to non-unique email
            var userAboveMaxAge = JSON.parse(JSON.stringify(user1));
            userAboveMaxAge['dob'] = '1936-09-23'; // always above max age
            userAboveMaxAge['local.email'] = 'volunteer@old.com';
            superAgent
                .post('/users/auth/signup')
                .send(userAboveMaxAge)
                .expect(400) //Status code
                .end(function (err, res) {
                    res.body.success.should.not.equal(true);
                    done();
                });
        });

        it('tests that dob is within allowed range', function (done) {
            var userWithinAgeLimit = JSON.parse(JSON.stringify(user1));
            userWithinAgeLimit['dob'] = '2001-09-22';
            userWithinAgeLimit['local.email'] = 'volunteer@rightage.com';
            superAgent
                .post('/users/auth/signup')
                .send(userWithinAgeLimit)
                .expect(200) //Status code
                .end(function (err, res) {
                    res.body.success.should.equal(true);
                    done();
                });
        });

        it('tests that dob is not less than min age', function (done) {
            var userBelowMinAge = JSON.parse(JSON.stringify(user1));
            var currentDate = new Date();
            userBelowMinAge['dob'] = new Date(
                currentDate.getFullYear() - 15, currentDate.getMonth(), currentDate.getDate()
            );
            userBelowMinAge['local.email'] = 'volunteer@younger.com';
            superAgent
                .post('/users/auth/signup')
                .send(userBelowMinAge)
                .expect(400) //Status code
                .end(function (err, res) {
                    res.body.success.should.not.equal(true);
                    done();
                });
        });

        // TODO: change
        it('tests that required information is needed', function (done) {
            var user = {
                "password": "test_3",
            };
            request(url)
                .post('/users')
                .send(user)
                .end(function (err, res) {
                    res.body.success.should.not.equal(true);
                    done();
                });
        });

        // TODO: change
        it('tests that duplicate emails cannot be created', function (done) {
            var user = {
                "first_name": "test_first",
                "last_name": "test_last",
                "email": "test1@gmail.com",
                "primary_institution": "stanny",
                "password": "eightdigits1M",
                "secondary_institution": "odododdo",
                "skill_1": "s",
                "skill_2": "f",
                "skill_3": "o",
                "skill_1_rating": 2,
                "skill_2_rating": 4,
                "skill_3_rating": 3,
                "gender": "Female",
                "dob": "2016-06-07"
            };

            request(url)
                .post('/users')
                .send(user)
                .end(function (err, res) {
                    res.body.success.should.not.equal(true);
                    done();
                });

        });


        it('tests that volunteer cannot change id', function (done) {
            superAgent
                .put('/users/')
                .send(userWithBadId)
                .end(function (err2, res2) {
                    res2.body.success.should.not.equal(true);
                    done();
                });
        });


        it('tests that volunteer cannot change email', function (done) {
            superAgent
                .put('/users/')
                .send(userWithBadEmail)
                .end(function (err2, res2) {
                    res2.body.success.should.not.equal(true);
                    done();
                });

        });

    });

    describe('tests that must have signed in user to access user routes', function () {

        it('tests non-signed in user cannot access /users', function (done) {
            request(url)
                .get('/users/')
                .end(function (err, res) {
                    res.body.success.should.not.equal(true);
                    done();
                });
        });

    });

    describe('Tests check email route', function () {
        it('tests that can determine email is actually in system', function (done) {
            request(url)
                .get('/users/email?email=' + user1['local.email'])
                .end(function (err, res) {
                    res.body.success.should.equal(true);
                    done();
                });
        });

        it('tests that can determine email is not in system', function (done) {
            request(url)
                .get('/users/email?email=missing@gmail.com')
                .end(function (err, res) {
                    res.body.success.should.not.equal(true);
                    done();
                });
        });

    });

    describe('tests user-project interaction', function () {

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

        it('creates company 2', function (done) {
            request(url)
                .post('/companies')
                .send(company2)
                .expect(200) //Status code
                .end(function (err, res) {
                    company2Id = res.body.id;
                    res.body.success.should.equal(true);
                    done();
                });
        });


        it('creates project 1', function (done) {
            project1['_company'] = company1Id;
            request(url)
                .post('/projects')
                .send(project1)
                .expect(200) //Status code
                .end(function (err, res) {
                    project1Id = res.body.id;
                    res.body.success.should.equal(true);
                    done();
                });
        });

        it('creates project 2', function (done) {
            project2['_company'] = company1Id;
            request(url)
                .post('/projects')
                .send(project2)
                .expect(200) //Status code
                .end(function (err, res) {
                    project2Id = res.body.id;
                    res.body.success.should.equal(true);
                    done();
                });
        });

        it('creates project 3', function (done) {
            project3['_company'] = company2Id;
            request(url)
                .post('/projects')
                .send(project3)
                .expect(200) //Status code
                .end(function (err, res) {
                    res.body.success.should.equal(true);
                    done();
                });
        });

        describe('getting project info', function () {
            it('checks retrieval of list of projects', function (done) {
                superAgent
                    .get('/users/projects')
                    .end(function (err, res) {
                        res.body.success.should.equal(true);
                        res.body.message.length.should.equal(3);
                        done();
                    });
            });

            it('checks retrieval of single project', function (done) {
                superAgent
                    .get('/users/project/' + project1Id)
                    .end(function (err, res) {
                        res.body.success.should.equal(true);
                        done();
                    });
            });


            it('checks retrieval of all of a companys projects', function (done) {
                superAgent
                    .get('/users/company/' + company1Id + '/projects')
                    .end(function (err, res) {
                        res.body.success.should.equal(true);
                        res.body.message.length.should.equal(2);
                        done();
                    });


            });

        });

        describe('favoriting a project', function () {

            it('should cause user 1 to have favorite column with proj_id', function (done) {
                superAgent
                    .put('/users/projects/favorite/' + project1Id)
                    .expect(200)
                    .end(function (err, res) {
                        if (res.body.success) {
                            superAgent
                                .get('/users/projects/favorite')
                                .expect(200)
                                .end(function (err2, res2) {
                                    res2.body.success.should.equal(true);
                                    res2.body.message._id.should.equal(project1Id);
                                    done();
                                });
                        }
                    });

            });

            it('should switch between favoriting project 2 instead of project 1', function (done) {
                superAgent
                    .put('/users/projects/favorite/' + project2Id)
                    .expect(200)
                    .end(function (err, res) {
                        if (res.body.success) {
                            superAgent
                                .get('/users/projects/favorite')
                                .expect(200)
                                .end(function (err2, res2) {
                                    res2.body.success.should.equal(true);
                                    res2.body.message._id.should.equal(project2Id);
                                    done();
                                });
                        }
                    });

            });

            it('makes user de-favorite project 2', function (done) {
                superAgent
                    .put('/users/projects/favorite/' + project2Id)
                    .expect(200)
                    .end(function (err, res) {
                        if (res.body.success) {
                            superAgent
                                .get('/users')
                                .expect(200)
                                .end(function (err2, res2) {
                                    if (res2.body.message.favorite == undefined) done();
                                });
                        }
                    });

            });

        });

        describe('Password Reset', function () {
            it('Send password reset email to user', function (done) {
                superAgent
                    .post('/password/reset/email')
                    .send({email: user1['local.email']})
                    .expect(200)
                    .end(function (err, res) {
                        res.body.success.should.equal(true);
                        done();
                    });
            });


            it('Fail Case: Verify invalid token', function (done) {
                superAgent
                    .post('/password/reset/token/verify')
                    .send({token: 'invalid token'})
                    .expect(400)
                    .end(function (err, res) {
                        res.body.success.should.equal(false);
                        done();
                    });
            });

            it('Success Case: Verify reset token', function (done) {
                User.findOne({'_id': user1Id}, function (err, user) {
                    if(err) done(err);
                    if(!user) done('User not found');
                    request.agent(url)
                        .post('/password/reset/token/verify')
                        .send({token: user.password_reset_token})
                        .expect(200)
                        .end(function (err, res) {
                            res.body.success.should.equal(true);
                            done();
                        });
                });
            });

            it('Success Case: Change Password', function (done) {
                User.findOne({'_id': user1Id}, function (err, user) {
                    if(err) done(err);
                    if(!user) done('User not found');
                    request.agent(url)
                        .post('/password/change')
                        .send({token: user.password_reset_token, password: 'Abcd123456'})
                        .expect(200)
                        .end(function (err, res) {
                            res.body.success.should.equal(true);
                            done();
                        });
                });
            });

            it('logs in with new password', function (done) {
                superAgent
                    .post('/users/auth/login')
                    .expect(200)
                    .send({'local.email':user1['local.email'], 'local.password': 'Abcd123456'})
                    .end(function (err, res) {
                        res.body.success.should.equal(true);
                        superAgent
                            .get('/users/')
                            .end(function (err, res) {
                                res.body.success.should.equal(true);
                                done();
                            });
                    });

            });
        });
    });

});
