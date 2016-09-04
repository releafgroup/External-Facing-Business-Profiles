var should = require('should'); 
var assert = require('assert');
var request = require('supertest');  
var mongoose = require('mongoose');
var config = require('../config.js');
var path = require('path');
var url = process.env.HOST_DOMAIN || 'http://localhost:3000';
var env = require('node-env-file');
var User = require('./../models/user.js');


var super_agent = request.agent(url);
var super_agent2 = (require('supertest')).agent(url);

var user1_id = -1;
var user1 = {
    "local.first_name" : "test_first",
    "local.last_name" : "test_last",
    "local.password" : "eightdigits",
    "local.email" : "test1@gmail.com",
    "primary_institution": "stanny",
    "secondary_institution": "odododdo",
    "skills": ["s", "f", "o"],
    "skill_ratings": [1, 2, 3],
    "gender": "Female",
    "dob": "2016-06-07",
    "favorite": null
}
var user_bad_email = JSON.parse(JSON.stringify(user1));
user_bad_email['local.email'] = "odddddd.com";

var user_update_info = JSON.parse(JSON.stringify(user1));
user_update_info = { "local.first_name" : "ififififif",
                "local.last_name" : "testee",
                "local.password" : "eightdigitsboy",
                "local.email" : "test1@gmail.com",
                "primary_institution": "nahhhhh",
                "secondary_institution": "okayyyyyyyy",
                "skills": ["c", "l", "t"],
                "skill_ratings": [2, 3, 4],

                "gender": "Male",
                "dob": "2016-08-03"}
var user_update_id_bad = JSON.parse(JSON.stringify(user1));
user_update_id_bad['id'] = '122222222';
var user_update_email_bad = JSON.parse(JSON.stringify(user1));
user_update_email_bad['local.email'] = "odddddd.com";

var user2 = {
    "local.first_name" : "test_sec",
    "local.last_name" : "test_last_sec",
    "local.password" : "eightdigits",
    "local.email" : "test2@gmail.com",
    "primary_institution": "stanny",
    "secondary_institution": "odododdo",
    "skills" : ["s", "f", "o"],
    "skill_ratings" : [2, 4, 3],
    "gender": "Female",
    "dob": "2016-06-07"
}
var user2_id = -1;

var project1 = {
    "project_description" : "test_second",
    "core_skill_1" : "App Development",
    "core_skill_2" : "Growth Strategy",
    "core_skill_3" : "Business Plan",
    "industry_focus": "Storage",
    "completion_time": 10,
    "number_staffed" : 5,
    "is_verified" : false,
    "favorite_count": 0
}

var proj1_id = -1;

var project2 = project1;

var proj2_id = -1;



var comp1_id = -1;
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

// TODO: add test cases for user permissions i.e. companies can't access this shit, users can't access other users shit, etc.

describe('Routing', function() {
    before(function(done) {
        // Use mocha test db
        mongoose.connect(config.mocha_database,function(){
            /* Drop the DB */
            mongoose.connection.db.dropDatabase();
        });
        done();
    });

    describe('Basic', function() {
        it('tests if can access main page', function(done) {
            request(url)
                .get('/')
                .end(function(err, res) {
                    res.body.title.should.equal('Welcome to the ikeora API');
                    done();
                });
        });

    });

    describe('Volunteer Sign Up', function() {
        it('tests basic sign up of Volunteer', function(done) {
            
            super_agent
                .post('/users/auth/signup')
                .send(user1)
                .expect(200) //Status code
                .end(function(err, res) {
                    user1_id = res.body.message;
                    res.body.success.should.equal(true);
                    done();
                });

        });

        it('tests if user is logged in after sign up', function(done) {
            super_agent
                .get('/users/')
                .expect(200)
                .end(function(err, res) {
                    res.body.success.should.equal(true);
                    done();
                });
                
        });
        
        it('tests user log out and that user cant access routes after log out', function(done) {
            super_agent
                .get('/users/auth/logout')
                .expect(200)
                .end(function(err, res) {
                    res.body.success.should.equal(true);
                    super_agent
                        .get('/users/')
                        .end(function(err, res) {
                            res.body.success.should.not.equal(true);
                            done();
                        });
                });
  

        });

        it('tests logging in user and accessing a route', function(done) {
            super_agent
                .post('/users/auth/login')
                .expect(200)
                .send(user1)
                .end(function(err, res) {
                    res.body.success.should.equal(true);
                    super_agent
                        .get('/users/')
                        .end(function(err, res) {
                            res.body.success.should.equal(true);
                            done();
                        });
                });

        });


        it('tests updating password and all other extra information after initial account creation', function(done) {
            super_agent
                .put('/users/')
                .send(user_update_info)
                .end(function(err2, res2) {
                    res2.body.success.should.equal(true);
                    done();
                });
        });

    });


    describe('Volunteer Validation', function() {

        // TODO: change
       it('tests that we check if an email has valid format', function(done) {
            

            super_agent
                .post('/users/auth/signup')
                .send(user_bad_email)
                .expect(200)
                .end(function(err, res) {
                    res.body.success.should.not.equal(true);
                    done();
                });


        });

        // TODO: change
        it('tests that required information is needed', function(done) {
            var user = {
                "password" : "test_3",
            }
            request(url)
                .post('/users')
                .send(user)
                .end(function(err, res) {
                    res.body.success.should.not.equal(true);
                    done();
                });
        });
        
        // TODO: change
        it('tests that duplicate emails cannot be created', function(done) {
            var user = {
                "first_name" : "test_first",
                "last_name" : "test_last",
                "email" : "test1@gmail.com",
                "primary_institution": "stanny",
                "password": "nahdudedd",
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
                .end(function(err, res) {
                    res.body.success.should.not.equal(true);
                    done();
                });

        });


        it('tests that volunteer cannot change id', function(done) {
            super_agent
                .put('/users/')
                .send(user_update_id_bad)
                .end(function(err2, res2) {
                    res2.body.success.should.not.equal(true);
                    done();
                });
        });



        it('tests that volunteer cannot change email', function(done) {
           super_agent
                .put('/users/')
                .send(user_update_email_bad)
                .end(function(err2, res2) {
                    res2.body.success.should.not.equal(true);
                    done();
                });

        });

    });

    describe('tests that must have signed in user to access user routes', function() {
    
        it('tests non-signed in user cannot access /users', function(done) {
            request(url)
                .get('/users/')
                .end(function(err, res) {
                    res.body.success.should.not.equal(true);
                    done();
                });
        });

    });

    describe('Tests check email route', function() {
        it('tests that can determine email is actually in system', function(done) {
            request(url)
                .get('/users/email')
                .send({'email': 'test1@gmail.com'})
                .end(function(err, res) {
                    res.body.success.should.equal(true);
                    done();
                });
        });

        it('tests that can determine email is not in system', function(done) {
            request(url)
                .get('/users/email')
                .send({'email': 'hey@gmail.com'})
                .end(function(err, res) {
                    res.body.success.should.not.equal(true);
                    done();
                });
        });

    });

    describe('tests user-project interaction', function() {

        it('creates a company', function(done) {
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
                .send(project1)
                .expect(200) //Status code
                .end(function(err, res) {
                    proj2_id = res.body.id;
                    res.body.success.should.equal(true);
                    done();
                });
        });

        describe('favoriting a project', function() {

            it('should cause user 1 to have favorite column with proj_id', function(done){
                super_agent
                    .put('/users/projects/favorite/'+ proj1_id)
                    .expect(200)
                    .end(function(err, res) {
                        console.log(res.body, 'response');
                        ((typeof res.body) === 'object').should.be.true;
                        done();
                    });
                
            });

            it('should cause project 1 to be favorited by user 1', function(done){
                super_agent
                    .put('/users/projects/favorite/'+ proj1_id)
                    .expect(200)
                    .end(function(err, res) {
                        res.body.success.should.equal(true);
                        done();
                    });
            });

            it('should cause user 1 to have favorite column with proj_id', function(done){
                super_agent
                    .put('/users/projects/favorite/'+ proj1_id)
                    .expect(200)
                    .end(function(err, res) {
                        res.body.message.should.equal(proj1_id);
                        super_agent
                            .put('/users/projects/favorite/'+ proj1_id)
                            .expect(200, done)
                            .expect(function(res2) {
                            }, done);
                    });
            });

            it('should cause user to unfavorite proj 1', function(done){
                super_agent
                    .put('/users/projects/favorite/'+ proj1_id)
                    .expect(200)
                    .end(function(err, res) {
                        res.body.message.should.equal(proj1_id);
                        super_agent
                            .put('/users/projects/favorite/'+ proj1_id)
                            .expect(200, done)
                            .expect(function(res2) {
                                (res2.body.message === undefined).should.equal(true);
                            }, done);
                    });
                
            });

            it('should not allow favoriting when user has a favorite', function(done){
                super_agent
                    .put('/users/projects/favorite/'+ proj1_id)
                    .expect(200)
                    .end(function(err, res) {
                        res.body.message.should.equal(proj1_id);
                        super_agent
                            .put('/users/projects/favorite/' + proj2_id)
                            .expect(200, done)
                            .expect(function(res2) {
                                console.log(res2.body, 'are you');
                                res2.body.message.should.equal("can have only one favorite");
                            }, done);
                    });
            });
        });
    });

});
