var should = require('should'); 
var assert = require('assert');
var request = require('supertest');  
var mongoose = require('mongoose');
var config = require('../config.js');

// Unit Tests to make sure Admin works
// Checks if users can be retrieved, companies retrieved, and if assignments can be made
// SUPER IMPORTANT NOTE: throughout the test cases we may modify these variables. the modifications persist across all of the test cases after any modification



var user1 = {
    "first_name" : "test_first",
    "last_name" : "test_last",
    "password" : "eightdigits",
    "email" : "test1@gmail.com",
    "primary_institution": "stanny",
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

var user2 = {
    "first_name" : "test_first_2",
    "last_name" : "test_last_2",
    "password" : "eightdigits",
    "email" : "test2@gmail.com",
    "primary_institution": "stanny",
    "secondary_institution": "odododdo",
    "skill_1": "s",
    "skill_2": "f",
    "skill_3": "o",
    "skill_1_rating": 2,
    "skill_2_rating": 4,
    "skill_3_rating": 3,
    "gender": "Male",
    "dob": "2016-06-07"
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

var company2 = {
    "business_name" : "business_second",
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
    var user1_id = -1;
    var user2_id = -1;
    var comp1_id = -1;
    var proj1_id = -1;
    var proj2_id = -1;

    describe('Setup users, projects companies for admin test', function() {
        it('creates user 1', function(done) {
            request(url)
                .post('/users')
                .send(user1)
                .expect(200) //Status code
                .end(function(err, res) {
                    user1_id = res.body.id;
                    res.body.success.should.equal(true);
                    done();
                });
        });

        it('creates user 2', function(done) {
            request(url)
                .post('/users')
                .send(user2)
                .expect(200) //Status code
                .end(function(err, res) {
                    user2_id = res.body.id;
                    res.body.success.should.equal(true);
                    done();
                });
        });

        it('creates company 1', function(done) {
            request(url)
                .post('/companies')
                .send(company1)
                .expect(200) //Status code
                .end(function(err, res) {
                    comp1_id = res.body.id;
                    res.body.success.should.equal(true);
                    done();
                });
        });


        it('creates project 1', function(done) {
            project1['_company'] = comp1_id;            
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
            project2['_company'] = comp1_id;
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

    });

    describe('User, Company, Project Retrieval', function() {
        it('tests retrieval of all users', function(done) {
            request(url)
                .get('/admin/volunteers')
                .expect(200) //Status code
                .end(function(err, res) {
                    console.log(res.body);
                    if (!err) done();
                });  
        
        });

        it('tests retrieval of all companies', function(done) {
            request(url)
                .get('/admin/companies')
                .expect(200) //Status code
                .end(function(err, res) {
                    console.log(res.body);
                    if (!err) done();
                });  
        
        });


        it('tests retrieval of all projects', function(done) {
            request(url)
                .get('/admin/projects')
                .expect(200) //Status code
                .end(function(err, res) {
                    console.log(res.body);
                    if (!err) done();
                });
        
        });

        it('tests retrieveal of single user', function(done) {
            request(url)
                .get('/admin/volunteers/' + user1_id)
                .expect(200) //Status code
                .end(function(err, res) {
                    console.log(res.body);
                    if (!err) done();
                });
        });

        it('tests retrieveal of single company', function(done) {
            request(url)
                .get('/admin/companies/' + comp1_id)
                .expect(200) //Status code
                .end(function(err, res) {
                    console.log(res.body);
                    if (!err) done();
                });
        });

        it('tests retrieveal of single project', function(done) {
            request(url)
                .get('/admin/projects/' + proj1_id)
                .expect(200) //Status code
                .end(function(err, res) {
                    console.log(res.body);
                    if (!err) done();
                });
        });

    });

    describe('User-Company Assignment', function() {
        

        it('create user-project assignment', function(done) {
            var assign = {"volunteer" : user1_id, "project" : proj1_id};
            request(url)
                .post('/admin/assign')
                .send(assign)
                .end(function(err, res) {
                    res.body.success.should.equal(true);
                    done();
                });
        });

        it('get all user-company assignments', function(done) {
            request(url)
                .get('/admin/assign')
                .expect(200) //Status code
                .end(function(err, res) {
                    console.log(res.body);
                    if (!err) done();
                }); 

        });

    });

    describe('Update project verification', function(done) {
        it('turn is_verified false to true for project', function(done) {
            project1['is_verified'] = true;
            request(url)
                .put('/admin/projects/verify/' + proj1_id)
                .send(project1)
                .end(function(err, res) {
                    res.body.success.should.equal(true);
                    done();
                });
        });

        it('turn is_verified true to false for project', function(done) {
            project1['is_verified'] = false;
            request(url)
                .put('/admin/projects/verify/' + proj1_id)
                .send(project1)
                .end(function(err, res) {
                    res.body.success.should.equal(true);
                    done();
                });

        });

        it('checks if error thrown when wrong project id given', function(done) {
            request(url)
                .put('/admin/projects/verify/' + "dddddddd")
                .send(project1)
                .end(function(err, res) {
                    console.log(res.body.message);
                    res.body.success.should.not.equal(true);
                    done();
                });


        });


        it('checks if error thrown when is_verified not given', function(done) {
            delete project1['is_verified'];
            request(url)
                .put('/admin/projects/verify/' + proj1_id)
                .send(project1)
                .end(function(err, res) {
                    console.log(res.body.message);
                    res.body.success.should.not.equal(true);
                    done();
                });


        });


    });

});


