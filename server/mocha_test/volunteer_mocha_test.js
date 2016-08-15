var should = require('should'); 
var assert = require('assert');
var request = require('supertest');  
var mongoose = require('mongoose');
var config = require('../config.js');
var url = 'http://localhost:3000';
var super_agent = request.agent(url);


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
var user_bad_email = JSON.parse(JSON.stringify(user1));
user_bad_email['email'] = "odddddd.com";

var user_update_info = JSON.parse(JSON.stringify(user1));
user_update_info = { "first_name" : "ififififif",
                "last_name" : "testee",
                "password" : "eightdigitsboy",
                "email" : "test1@gmail.com",
                "primary_institution": "nahhhhh",
                "secondary_institution": "okayyyyyyyy",
                "skill_1": "c",
                "skill_2": "l",
                "skill_3": "t",
                "skill_1_rating": 5,
                "skill_2_rating": 2,
                "skill_3_rating": 4,
                "gender": "Male",
                "dob": "2016-08-03"}
var user_update_id_bad = JSON.parse(JSON.stringify(user1));
user_update_id_bad['id'] = '122222222';
var user_update_email_bad = JSON.parse(JSON.stringify(user1));


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
                    console.log(res.body);
                    res.body.success.should.equal(true);
                    done();
                });

        });

        it('tests if user is logged in after sign up', function(done) {
            super_agent
                .get('/users/id')
                .send(user1)
                .expect(200)
                .end(function(err, res) {
                    console.log(res.body);
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
                    console.log(res.body);
                    super_agent
                        .get('/users/id')
                        .send(user1)
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
                    console.log(res.body);
                    super_agent
                        .get('/users/id')
                        .send(user1)
                        .end(function(err, res) {
                            console.log(res.body);
                            res.body.success.should.equal(true);
                            done();
                        });
                });

        });


        it('tests updating password and all other extra information after initial account creation', function(done) {
            // Have to figure out ID first from email
            // TODO: just store id from pass back in previous
            super_agent
                .get('/users/id')
                .send(user_update_info)
                .end(function(err, res) {
                    if (res.body.success == true) {
                        super_agent
                            .put('/users/' + res.body.id)
                            .send(user_update_info)
                            .end(function(err2, res2) {
                                console.log(res2.body);
                                res2.body.success.should.equal(true);
                                done();
                            });
                    }
                });

        });

    });


    describe('Volunteer Validation', function() {


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
            // Have to figure out ID first from email
            super_agent
                .get('/users/id')
                .send(user_update_id_bad)
                .end(function(err, res) {
                    if (res.body.success == true) {
                        super_agent
                            .put('/users/' + res.body.id)
                            .send(user_update_id_bad)
                            .end(function(err2, res2) {
                                console.log(res2.body);
                                res2.body.success.should.not.equal(true);
                                done();
                            });
                    }
                });


        });

        it('tests that volunteer cannot change email', function(done) {
            // Have to figure out ID first from email
            super_agent
                .get('/users/id')
                .send(user_update_email_bad)
                .end(function(err, res) {
                    if (res.body.success == true) {
                        user_update_email_bad.email = "ddddddd.com";
                        super_agent
                            .put('/users/' + res.body.id)
                            .send(user_update_email_bad)
                            .end(function(err2, res2) {
                                console.log(res2.body);
                                res2.body.success.should.not.equal(true);
                                done();
                            });
                    }
                });


        });


    });



});
