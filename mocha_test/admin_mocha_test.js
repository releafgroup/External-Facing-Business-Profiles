var should = require('should');
var assert = require('assert');
var request = require('supertest');
var mongoose = require('mongoose');
var config = require('../config.js');
var testHelpers = require('../helpers/test');
var server = require('../bin/www');

/**
 * Unit Tests to make sure Admin works
 * Checks if users can be retrieved, companies retrieved, and if assignments can be made
 * SUPER IMPORTANT NOTE: throughout the test cases we may modify these variables,
 * the modifications persist across all of the test cases after any modification
 */
var url = testHelpers.url;

var admin1Id = -1;
var superAgentAdmin = (require('supertest')).agent(url);
var admin1 = testHelpers.admin1;

var superAgent1 = request.agent(url);
var user1Id = -1;
var user1 = testHelpers.user1;

var superAgent2 = (require('supertest')).agent(url);
var user2Id = -1;
var user2 = testHelpers.user2;

var company1Id = -1;
var company1 = testHelpers.company1();

var comp2_id = -1;
var company2 = testHelpers.company2();

var project1Id = -1;
var project1 = testHelpers.project1;

var project2Id = -1;
var project2 = testHelpers.project2;

describe('Routing', function () {

    before(function (done) {
        // Use mocha test db
        mongoose.connection.once('connected', () => {
            /* Drop the DB */
            mongoose.connection.db.dropDatabase();
        });
        done();
    });

    describe('Creates admin user', function () {
        it('creates admin 1', function (done) {
            superAgentAdmin
                .post('/admin')
                .send(admin1)
                .expect(200)
                .end(function (err, res) {
                    admin1Id = res.body.message;
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


    });

    describe('Setup users, projects companies for admin test', function () {
        it('creates user 1', function (done) {
            superAgent1
                .post('/users/auth/signup')
                .send(user1)
                .expect(200) //Status code
                .end(function (err, res) {
                    user1Id = res.body.message;
                    res.body.success.should.equal(true);
                    done();
                });
        });

        it('creates user 2', function (done) {
            superAgent2
                .post('/users/auth/signup')
                .send(user2)
                .expect(200) //Status code
                .end(function (err, res) {
                    user2Id = res.body.message;
                    res.body.success.should.equal(true);
                    done();
                });
        });


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

    });

    describe('User, Company, Project Retrieval', function () {
        it('tests retrieval of all users', function (done) {
            superAgentAdmin
                .get('/admin/volunteers')
                .expect(200) //Status code
                .end(function (err, res) {
                    if (!err) {
                        res.body.success.should.equal(true);
                        done();
                    }
                });

        });

        it('tests retrieval of all companies', function (done) {
            superAgentAdmin
                .get('/admin/companies')
                .expect(200) //Status code
                .end(function (err, res) {
                    if (!err) {
                        res.body.success.should.equal(true);
                        done();
                    }
                });

        });


        it('tests retrieval of all projects', function (done) {
            superAgentAdmin
                .get('/admin/projects')
                .expect(200) //Status code
                .end(function (err, res) {
                    if (!err) {
                        res.body.success.should.equal(true);
                        done();
                    }
                });

        });

        it('tests retrieveal of single user', function (done) {
            superAgentAdmin
                .get('/admin/volunteers/' + user1Id)
                .expect(200) //Status code
                .end(function (err, res) {
                    if (!err) {
                        res.body.success.should.equal(true);
                        done();
                    }
                });
        });

        it('tests retrieveal of single company', function (done) {
            superAgentAdmin
                .get('/admin/companies/' + company1Id)
                .expect(200) //Status code
                .end(function (err, res) {
                    if (!err) {
                        res.body.success.should.equal(true);
                        done();
                    }
                });
        });

        it('tests retrieveal of single project', function (done) {
            superAgentAdmin
                .get('/admin/projects/' + project1Id)
                .expect(200) //Status code
                .end(function (err, res) {
                    if (!err) {
                        res.body.success.should.equal(true);
                        done();
                    }
                });
        });

    });
});
