var should = require('should'); 
var assert = require('assert');
var request = require('supertest');  
var mongoose = require('mongoose');
var config = require('../config.js');

// Unit Tests to make sure Admin works
// Checks if users can be retrieved, companies retrieved, and if assignments can be made

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

    describe('Setup users and companies for admin test', function() {
        it('creates user 1', function(done) {
            request(url)
                .post('/users')
                .send(user1)
                .expect(200) //Status code
                .end(function(err, res) {
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
                    res.body.success.should.equal(true);
                    done();
                });
        });


        it('creates company 2', function(done) {
            request(url)
                .post('/companies')
                .send(company2)
                .expect(200) //Status code
                .end(function(err, res) {
                    res.body.success.should.equal(true);
                    done();
                });
        });

    });

    describe('User, Company Retrieval', function() {
        it('tests retrieval of all users', function(done) {
            request(url)
                .get('/admin/volunteers')
                .expect(200) //Status code
                .end(function(err, res) {
                    if (!err) done();
                });  
        
        });

        it('tests retrieval of all companies', function(done) {
            request(url)
                .get('/admin/companies')
                .expect(200) //Status code
                .end(function(err, res) {
                    if (!err) done();
                });  
        
        });

    });

    describe('User-Company Assignment', function() {
        it('get all user-company assignments', function(done) {
            request(url)
                .get('/admin/assign')
                .expect(200) //Status code
                .end(function(err, res) {
                    if (!err) done();
                }); 

        });

        it('create user-company assignment', function(done) {

            request(url)
                .get('/companies/id')
                .send(company1)
                .end(function(comp_err, comp_res) {
                    if (comp_res.body.success == true) {
                        request(url)
                            .get('/users/id')
                            .send(user1)
                            .end(function(user_err, user_res) {
                                if (user_res.body.success == true) {
                                    var assign = {"volunteer" : user_res.body.id, "company" : comp_res.body.id};
                                    request(url)
                                        .post('/admin/assign')
                                        .send(assign)
                                        .end(function(err, res) {
                                            res.body.success.should.equal(true);
                                            done();
                                        });
                                }
                            });
                    }
                });
        });


        it('create another user-company assignment, use same company, different users', function(done) {
            request(url)
                .get('/companies/id')
                .send(company1)
                .end(function(comp_err, comp_res) {
                    if (comp_res.body.success == true) {
                        request(url)
                            .get('/users/id')
                            .send(user2)
                            .end(function(user_err, user_res) {
                                if (user_res.body.success == true) {
                                    var assign = {"volunteer" : user_res.body.id, "company" : comp_res.body.id};
                                    request(url)
                                        .post('/admin/assign')
                                        .send(assign)
                                        .end(function(err, res) {
                                            res.body.success.should.equal(true);
                                            done();
                                        });
                                }
                            });
                    }
                });

        });


        it('create another user-company assignment', function(done) {
            request(url)
                .get('/companies/id')
                .send(company2)
                .end(function(comp_err, comp_res) {
                    if (comp_res.body.success == true) {
                        request(url)
                            .get('/users/id')
                            .send(user2)
                            .end(function(user_err, user_res) {
                                if (user_res.body.success == true) {
                                    var assign = {"volunteer" : user_res.body.id, "company" : comp_res.body.id};
                                    request(url)
                                        .post('/admin/assign')
                                        .send(assign)
                                        .end(function(err, res) {
                                            res.body.success.should.equal(true);
                                            done();
                                        });
                                }
                            });
                    }
                });

        });


        it('deletes a user-company assignment', function(done) {
            request(url)
                .get('/companies/id')
                .send(company2)
                .end(function(comp_err, comp_res) {
                    if (comp_res.body.success == true) {
                        request(url)
                            .get('/users/id')
                            .send(user2)
                            .end(function(user_err, user_res) {
                                if (user_res.body.success == true) {
                                    var assign = {"volunteer" : user_res.body.id, "company" : comp_res.body.id};
                                    request(url)
                                        .delete('/admin/assign')
                                        .send(assign)
                                        .end(function(err, res) {
                                            res.body.success.should.equal(true);
                                            done();
                                        });
                                }
                            });
                    }
                });

        });

        it('gets user-company assignment lists', function(done) {
            request(url)
                .get('/admin/assign')
                .end(function(err, res) {
                    res.body.length.should.equal(2);
                    if (!err) done();
                });

        });


    });

});


