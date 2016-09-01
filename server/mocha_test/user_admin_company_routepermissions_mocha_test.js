var should = require('should'); 
var assert = require('assert');
var request = require('supertest');  
var mongoose = require('mongoose');
var config = require('../config.js');


var url = 'http://localhost:3000';

var admin1_id = -1;
var super_agent_admin = (require('supertest')).agent(url);
var admin1 = {
    'name' : 'admin1@gmail.com',
    'password' : 'admin1'
}

var super_agent1 = request.agent(url);
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

describe('Routing', function() {
    before(function(done) {
        // Use mocha test db
        mongoose.connect(config.mocha_database,function(){
            /* Drop the DB */
            mongoose.connection.db.dropDatabase();
        });
        done();
    });

    describe('Creates admin + regular user', function() {
        it('creates admin 1', function(done) {
            super_agent_admin
                .post('/admin')
                .send(admin1)
                .expect(200)
                .end(function(err, res) {
                    console.log(res.body);
                    admin1_id = res.body.message;
                    res.body.success.should.equal(true);
                    done();
                });
            
        });

        it('tries to login admin 1', function(done) {
            super_agent_admin
                .post('/admin/auth/login')
                .send(admin1)
                .end(function(err, res) {
                    console.log(res.body);
                    res.body.success.should.equal(true);
                    done();
                });

        });

        it('creates user 1', function(done) {
             super_agent1
                .post('/users/auth/signup')
                .send(user1)
                .expect(200) //Status code
                .end(function(err, res) {
                    console.log(res.body);
                    user1_id = res.body.message;
                    res.body.success.should.equal(true);
                    done();
                });
        });


    });

    describe('Checks Permissions', function() {
        it('checks that user 1 cannot access admin 1 routes', function(done) {
            super_agent1
                .get('/admin/volunteers')
                .end(function(err, res) {
                    console.log(res.body);
                    res.body.success.should.not.equal(true);
                    done();
                });

        });

        it('checks that admin 1 cannot access user 1 routes', function(done) {
            super_agent_admin
                .get('/users')
                .end(function(err, res) {
                    console.log(res.body);
                    res.body.success.should.not.equal(true);
                    done();
                });

        });

    });

});

