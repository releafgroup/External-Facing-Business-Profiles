var should = require('should'); 
var assert = require('assert');
var request = require('supertest');  
var mongoose = require('mongoose');
var config = require('../config.js');



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
        it('tests basic creation of Volunteer (email, first_name, last_name, pwd)', function(done) {
            var user = {
                "first_name" : "test_first",
                "last_name" : "test_last",
                "password" : "aydude",
                "email" : "test1.gmail.com"
            }

            request(url)
                .post('/users')
                .send(user)
                .expect(200) //Status code
                .end(function(err, res) {
                    res.body.success.should.equal(true);
                    done();
                });

        });
        
        it('tests basic creation of Volunteer w/o password', function(done) {
            var user = {
                "first_name" : "test_first",
                "last_name" : "test_last",
                "email" : "test_2.gmail.com"
            }

            request(url)
                .post('/users')
                .send(user)
                .expect(200)
                .end(function(err, res) {
                    res.body.success.should.equal(true);
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
                "email" : "test_2.gmail.com",
                "first_name" : "test_firsts",
                "last_name" : "test_lasts",
            }

            request(url)
                .post('/users')
                .send(user)
                .end(function(err, res) {
                    res.body.success.should.not.equal(true);
                    done();
                });

        });
    });



    describe('Volunteer Update', function() {
        it('tests adding password and all other extra information after initial account creation', function(done) {
            // Have to figure out ID first from email
            var user = {
                "first_name" : "test_first_change",
                "last_name" : "test_last_change",
                "password" : "aydudedddd",
                "email" : "test1.gmail.com",
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
            
            request(url)
                .get('/users/id')
                .send(user)
                .end(function(err, res) {
                    if (res.body.success == true) {
                        request(url)
                            .put('/users/' + res.body.id)
                            .send(user)
                            .end(function(err2, res2) {
                                res2.body.success.should.equal(true);
                                done();
                            });
                    }
                });

        });

        it('tests that volunteer cannot change id', function(done) {
            // Have to figure out ID first from email
             var user = {
                "email" : "test1.gmail.com",
                "id": "eeeeeeeeee"
            }
            
            request(url)
                .get('/users/id')
                .send(user)
                .end(function(err, res) {
                    if (res.body.success == true) {
                        request(url)
                            .put('/users/' + res.body.id)
                            .send(user)
                            .end(function(err2, res2) {
                                res2.body.success.should.not.equal(true);
                                done();
                            });
                    }
                });


        });

        it('tests that volunteer cannot change email', function(done) {
            // Have to figure out ID first from email
            var user = {
                "email" : "test1.gmail.com",
            }
            
            request(url)
                .get('/users/id')
                .send(user)
                .end(function(err, res) {
                    if (res.body.success == true) {
                        user.email = "change@gmail.com";
                        request(url)
                            .put('/users/' + res.body.id)
                            .send(user)
                            .end(function(err2, res2) {
                                res2.body.success.should.not.equal(true);
                                done();
                            });
                    }
                });


        });

    });

});
