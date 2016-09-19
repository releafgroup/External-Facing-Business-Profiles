var should = require('should');
var assert = require('assert');
var request = require('supertest');
var mongoose = require('mongoose');
var config = require('../config.js');
var path = require('path');
var url = process.env.HOST_DOMAIN || 'http://localhost:3000';
var User = require('./../models/user.js');
var testHelpers = require('../helpers/test');


var super_agent = request.agent(url);
var super_agent2 = (require('supertest')).agent(url);

var user1Id = -1;
var user1 = testHelpers.user1;
var userWithBadEmail = JSON.parse(JSON.stringify(user1));
userWithBadEmail['local.email'] = "odddddd.com";

var userUpdateInfo = JSON.parse(JSON.stringify(user1));
userUpdateInfo = testHelpers.userUpdateInfo;

var userWithBadId = JSON.parse(JSON.stringify(user1));
userWithBadId['id'] = '122222222';

var user2 = testHelpers.user2;
var user2Id = -1;

var project1 = testHelpers.project1;

var project1Id = -1;

var project2 = JSON.parse(JSON.stringify(project1));

var project2Id = -1;

var project3 = JSON.parse(JSON.stringify(project1));
var project3Id = -1;


var company1Id = -1;
var company1 = testHelpers.company1;

var company2Id = -1;
var company2 = JSON.parse(JSON.stringify(company1));

// TODO: add test cases for user permissions
// i.e. companies can't access this, users can't access other users data, etc.
describe('Routing', function () {
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

            super_agent
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
            super_agent
                .get('/users/')
                .expect(200)
                .end(function (err, res) {
                    res.body.success.should.equal(true);
                    done();
                });

        });

        it('tests user log out and that user cant access routes after log out', function (done) {
            super_agent
                .get('/users/auth/logout')
                .expect(200)
                .end(function (err, res) {
                    res.body.success.should.equal(true);
                    super_agent
                        .get('/users/')
                        .end(function (err, res) {
                            res.body.success.should.not.equal(true);
                            done();
                        });
                });


        });

        it('tests logging in user and accessing a route', function (done) {
            super_agent
                .post('/users/auth/login')
                .expect(200)
                .send(user1)
                .end(function (err, res) {
                    res.body.success.should.equal(true);
                    super_agent
                        .get('/users/')
                        .end(function (err, res) {
                            res.body.success.should.equal(true);
                            done();
                        });
                });

        });


        it('tests updating password and all other extra information after initial account creation', function (done) {
            super_agent
                .put('/users/')
                .send(userUpdateInfo)
                .end(function (err2, res2) {
                    res2.body.success.should.equal(true);
                    done();
                });
        });

    });


    describe('Volunteer Validation', function () {

        // TODO: change
        it('tests that we check if an email has valid format', function (done) {


            super_agent
                .post('/users/auth/signup')
                .send(userWithBadEmail)
                .expect(200)
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
            }

            request(url)
                .post('/users')
                .send(user)
                .end(function (err, res) {
                    res.body.success.should.not.equal(true);
                    done();
                });

        });


        it('tests that volunteer cannot change id', function (done) {
            super_agent
                .put('/users/')
                .send(userWithBadId)
                .end(function (err2, res2) {
                    res2.body.success.should.not.equal(true);
                    done();
                });
        });


        it('tests that volunteer cannot change email', function (done) {
            super_agent
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
                .get('/users/email')
                .send({'email': 'test1@gmail.com'})
                .end(function (err, res) {
                    res.body.success.should.equal(true);
                    done();
                });
        });

        it('tests that can determine email is not in system', function (done) {
            request(url)
                .get('/users/email')
                .send({'email': 'hey@gmail.com'})
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
                    project3Id = res.body.id;
                    res.body.success.should.equal(true);
                    done();
                });
        });

        describe('getting project info', function () {
            it('checks retrieval of list of projects', function (done) {
                super_agent
                    .get('/users/projects')
                    .end(function (err, res) {
                        res.body.success.should.equal(true);
                        res.body.message.length.should.equal(3);
                        done();
                    });
            });

            it('checks retrieval of single project', function (done) {
                super_agent
                    .get('/users/project/' + project1Id)
                    .end(function (err, res) {
                        res.body.success.should.equal(true);
                        done();
                    });
            });


            it('checks retrieval of all of a companys projects', function (done) {
                super_agent
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
                super_agent
                    .put('/users/projects/favorite/' + project1Id)
                    .expect(200)
                    .end(function (err, res) {
                        if (res.body.success) {
                            super_agent
                                .get('/users')
                                .expect(200)
                                .end(function (err2, res2) {
                                    res2.body.message.favorite.should.equal(project1Id);
                                    res2.body.success.should.equal(true);
                                    done();
                                });
                        }
                    });

            });

            it('should switch between favoriting project 2 instead of project 1', function (done) {
                super_agent
                    .put('/users/projects/favorite/' + project2Id)
                    .expect(200)
                    .end(function (err, res) {
                        if (res.body.success) {
                            super_agent
                                .get('/users')
                                .expect(200)
                                .end(function (err2, res2) {
                                    res2.body.message.favorite.should.equal(project2Id);
                                    res2.body.success.should.equal(true);
                                    done();
                                });
                        }
                    });

            });

            it('makes user de-favorite project 2', function (done) {
                super_agent
                    .put('/users/projects/favorite/' + project2Id)
                    .expect(200)
                    .end(function (err, res) {
                        if (res.body.success) {
                            super_agent
                                .get('/users')
                                .expect(200)
                                .end(function (err2, res2) {
                                    if (res2.body.message.favorite == undefined) done();
                                });
                        }
                    });

            });

        });
    });

});
