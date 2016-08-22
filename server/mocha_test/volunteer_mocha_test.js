var should = require('should'); 
var assert = require('assert');
var request = require('supertest');  
var mongoose = require('mongoose');
var config = require('../config.js');
var path = require('path');
var env = require('node-env-file');

env(path.join(__dirname, '../.env'));
var url = process.env.HOST_DOMAIN;
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
    "dob": "2016-06-07"
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
                    console.log(res2.body);
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
                    console.log(res2.body);
                    res2.body.success.should.not.equal(true);
                    done();
                });
        });



        it('tests that volunteer cannot change email', function(done) {
           super_agent
                .put('/users/')
                .send(user_update_email_bad)
                .end(function(err2, res2) {
                    console.log(res2.body);
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
                    console.log(res.body);
                    res.body.success.should.not.equal(true);
                    done();
                });
        });

    });

});
