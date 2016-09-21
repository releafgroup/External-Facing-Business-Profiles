var should = require('should');
var assert = require('assert');
var request = require('supertest');
var mongoose = require('mongoose');
var config = require('../config.js');
var testHelpers = require('../helpers/test');
var server = require('../bin/www');

/**
 * SUPER IMPORTANT NOTE: throughout the test cases we may modify these variables. the modifications persist across all of the test cases after any modification
 */
var project1 = testHelpers.project1,
    project2 = testHelpers.project2,
    project3 = testHelpers.project3,
    company1 = testHelpers.company1,
    url = testHelpers.url,
    agent = request.agent(url);

describe('Projects Routes', function () {
    before(function (done) {
        // Use mocha test db
        mongoose.connect(config.mocha_database, function () {
            /* Drop the DB */
            mongoose.connection.db.dropDatabase();
        });
        agent.post('/users/auth/signup')
            .send(testHelpers.user1)
            .end(function (err, res) {
            });
        // Insert user into database
        done();
    });
    var companyId = -1;
    var projectId1 = -1;
    var projectId2 = -1;

    describe('Company & Project Creation', function () {
        it('creates company 1', function (done) {
            request(url)
                .post('/companies')
                .send(company1)
                .expect(200) //Status code
                .end(function (err, res) {
                    res.body.success.should.equal(true);
                    companyId = res.body.id;
                    done();
                });
        });

        it('creates project 1', function (done) {
            project1['_company'] = companyId;
            request(url)
                .post('/projects')
                .send(project1)
                .expect(200) //Status code
                .end(function (err, res) {

                    projectId1 = res.body.id;
                    res.body.success.should.equal(true);
                    done();
                });
        });

        it('creates project 2', function (done) {
            project2['_company'] = companyId;
            request(url)
                .post('/projects')
                .send(project2)
                .expect(200) //Status code
                .end(function (err, res) {

                    projectId2 = res.body.id;
                    res.body.success.should.equal(true);
                    done();
                });
        });

        it('gets project 1', function (done) {
            request(url)
                .get('/projects/' + projectId1)
                .end(function (err, res) {
                    if (!err) done();
                });
        });

        it('gets project 2', function (done) {
            request(url)
                .get('/projects/' + projectId2)
                .end(function (err, res) {
                    if (!err) done();
                });
        });

        it('checks company has two projects', function (done) {
            request(url)
                .get('/companies/' + companyId)
                .end(function (err, res) {
                    res.body.message.projects.length.should.equal(2);
                    if (!err) done();
                });
        });

        it('get projects based on skills', function (done) {
            agent.get('/projects?skills=Data Analytics')
                .end(function (err, res) {
                    res.body.message.length.should.equal(1);
                });
            agent.get('/projects?skills=Business Plan')
                .end(function (err, res) {
                    res.body.message.length.should.equal(1);
                });
            agent.get('/projects?skills=App Development')
                .end(function (err, res) {
                    res.body.message.length.should.equal(2);
                    done();
                });
        });

        it('Fail test>> get projects without skills', function (done) {
            agent.get('/projects')
                .expect(400)
                .end(function (err, res) {
                    res.body.success.should.equal(false);
                    done();
                });
        });
    });

    describe('Project creation errors', function () {
        it('tests cannot create project with verified set to true', function (done) {
            project3['_company'] = companyId;
            request(url)
                .post('/projects')
                .send(project3)
                .end(function (err, res) {
                    res.body.success.should.not.equal(true);
                    done();
                });
        });
    });

    describe('Project update errors', function () {
        it('tests cant change company id', function (done) {
            var project1_new = project1;
            project1_new['_company'] = '111f';
            request(url)
                .put('/projects/' + projectId1)
                .send(project1_new)
                .end(function (err, res) {
                    res.body.success.should.not.equal(true);
                    done();
                });
        });

        it('tests cant change project id', function (done) {
            var project1_new = project1;
            project1_new['_company'] = companyId;
            project1_new['id'] = '111111';
            request(url)
                .put('/projects/' + projectId1)
                .send(project1_new)
                .end(function (err, res) {
                    res.body.success.should.not.equal(true);
                    done();
                });
        });

        it('tests company cannot change project verified to true', function (done) {
            project2['is_verified'] = true;
            request(url)
                .put('/projects/' + projectId2)
                .send(project2)
                .end(function (err, res) {
                    res.body.success.should.not.equal(true);
                    done();
                });
        });
    });
});
