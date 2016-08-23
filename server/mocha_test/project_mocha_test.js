var should = require('should'); 
var assert = require('assert');
var request = require('supertest');  
var mongoose = require('mongoose');
var config = require('../config.js');

// Unit Tests to make sure Admin works
// Checks if users can be retrieved, companies retrieved, and if assignments can be made
// SUPER IMPORTANT NOTE: throughout the test cases we may modify these variables. the modifications persist across all of the test cases after any modification

var project1 = {
    "project_description" : "test_first",
    "core_skill_1" : "App Development",
    "core_skill_2" : "Growth Strategy",
    "core_skill_3" : "Business Plan",
    "industry_focus": "Storage",
    "completion_time": 10,
    "number_staffed" : 5,
    "is_verified" : false
}

var project2 = {
    "project_description" : "test_second",
    "core_skill_1" : "App Development",
    "core_skill_2" : "Growth Strategy",
    "core_skill_3" : "Business Plan",
    "industry_focus": "Storage",
    "completion_time": 10,
    "number_staffed" : 5,
    "is_verified" : false
}

var project3  = { // Should produce error
    "project_description" : "test_second",
    "core_skill_1" : "App Development",
    "core_skill_2" : "Growth Strategy",
    "core_skill_3" : "Business Plan",
    "industry_focus": "Storage",
    "completion_time": 10,
    "number_staffed" : 5,
    "is_verified" : true
}



var company1 = {
    "business_name" : "business_first",
    "primary_contact_name" : "emmmmmmmmmm o",
    "primary_contact_phone" : "123-7045195845",
    "password" : "eightdigitsboy",
                
    "company_purpose" : "the purpose is to test if the creation works",
    "company_size" :  "1 Partner",
    "company_industry_1" : "Processing",
    "company_industry_2" : "Transport",
    "company_industry_3" : "Storage",
    "value_hoped_for" : "we hope to get a lot of value",
    "short_term_obj" : "short term objective",
    "long_term_obj" : "long term objective", 
    "pressing_problems" : "talent and capital", 
    "best_medium" : "Email",
    "internet_access" : "Work Hours"
}



describe('Routing', function() {
    var url = 'http://localhost:3000';
    before(function(done) {
        // Use mocha test db
        mongoose.connect(config.mocha_database,function(){
            /* Drop the DB */
            mongoose.connection.db.dropDatabase();
        });
        done();
    });
    var comp_id = -1;
    var proj1_id = -1;
    var proj2_id = -1;
    describe('Company & Project Creation', function() {

        
        it('creates company 1', function(done) {
            request(url)
                .post('/companies')
                .send(company1)
                .expect(200) //Status code
                .end(function(err, res) {
                    res.body.success.should.equal(true);
                    comp_id = res.body.id;
                    done();
                });
        });

        it('creates project 1', function(done) {
            project1['_company'] = comp_id;
            request(url)
                .post('/projects')
                .send(project1)
                .expect(200) //Status code
                .end(function(err, res) {
                    proj1_id = res.body.id;
                    res.body.success.should.equal(true);
                    done();
                });
        });

        it('creates project 2', function(done) {
            project2['_company'] = comp_id;
            request(url)
                .post('/projects')
                .send(project2)
                .expect(200) //Status code
                .end(function(err, res) {
                    proj2_id = res.body.id;
                    res.body.success.should.equal(true);
                    done();
                });
        });

        it('gets project 1', function(done) {
            request(url)
                .get('/projects/' + proj1_id)
                .end(function(err, res) {
                    if (!err) done();
                });
        });

        it('gets project 2', function(done) {
            request(url)
                .get('/projects/' + proj2_id)
                .end(function(err, res) {
                    if (!err) done();
                });
        });


        it('checks company has two projects', function(done) {
            request(url)
                .get('/companies/' + comp_id)
                .end(function(err, res) {
                    res.body.message.projects.length.should.equal(2);
                    if (!err) done();
                });
        });

    });

    describe('Project creation errors', function() {
        it('tests cannot create project with verified set to true', function(done) {
            project3['_company'] = comp_id;
            request(url)
                .post('/projects')
                .send(project3)
                .end(function(err, res) {
                    console.log(res.body.message);
                    res.body.success.should.not.equal(true);
                    done();
                });
        });

    });


    describe('Project update errors', function() {
        it('tests cant change company id', function(done) {
            var project1_new = project1;
            project1_new['_company'] = '111f';
            request(url)
                .put('/projects/' + proj1_id)
                .send(project1_new)
                .end(function(err, res) {
                    console.log(res.body.message);
                    res.body.success.should.not.equal(true);
                    done();
                });
        });

        it('tests cant change project id', function(done) {
            var project1_new = project1;
            project1_new['_company'] = comp_id;
            project1_new['id'] = '111111';
            request(url)
                .put('/projects/' + proj1_id)
                .send(project1_new)
                .end(function(err, res) {
                    console.log(res.body.message);
                    res.body.success.should.not.equal(true);
                    done();
                });

        });

        it('tests company cannot change project verified to true', function(done) {
            project2['is_verified'] = true;
            request(url)
                .put('/projects/' + proj2_id)
                .send(project2)
                .end(function(err, res) {
                    console.log(res.body.message);
                    res.body.success.should.not.equal(true);
                    done();
                });
        });

    });


});



