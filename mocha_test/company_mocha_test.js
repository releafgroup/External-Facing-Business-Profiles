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

    describe('Company Sign Up', function() {
        it('tests basic creation of Company with only required information', function(done) {
            var company = {
                "business_name" : "test_first",
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

            request(url)
                .post('/companies')
                .send(company)
                .expect(200) //Status code
                .end(function(err, res) {
                    res.body.success.should.equal(true);
                    done();
                });

        });
        
        it('tests that required information is needed', function(done) {
            var company = {
                "email" : "company1@gmail.com",
            }

            request(url)
                .post('/companies')
                .send(company)
                .end(function(err, res) {
                    console.log(res.body.message);
                    res.body.success.should.not.equal(true);
                    done();
                });


        });

        it('tests that cant create duplicate business', function(done) {
            var company = {
                "business_name" : "test_first",
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

            request(url)
                .post('/companies')
                .send(company)
                .end(function(err, res) {
                    console.log(res.body.message);
                    res.body.success.should.not.equal(true);
                    done();
                });


        });

        it('tests basic creation of Company with all optional  information (email, lca, state)', function(done) {
            var company = {
                "business_name" : "test_second",
                "primary_contact_name" : "emmmmmmmmmm o",
                "primary_contact_phone" : "123-7045195845",
                "password" : "eightdigitsboy",
                
                "email" : "odespo@gmail.com",
                "state" : "state_nigeria",
                "lca" : "lca_1",
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

            request(url)
                .post('/companies')
                .send(company)
                .end(function(err, res) {
                    console.log(res.body.message);
                    res.body.success.should.equal(true);
                    done();
                });


        })
    });



   describe('Volunteer Update', function() {
        it('tests adding password and all other extra information after initial account creation', function(done) {
            // Have to figure out ID first from business name
            var company = {
                "business_name" : "test_second",
                
                "primary_contact_name" : "test_last_1",
                "primary_contact_phone" : "123-7045195845",
                "password" : "dhiwuhiuhdwiuhd",

                "email" : "odespo2@gmail.com",
                "state" : "state_nigeria_1",
                "lca" : "lca_1_1",
                "company_purpose" : "the purpose is to test if the creation works_1",
                "company_size" :  "11 - 50 Employees",
                "company_industry_1" : "Trade",
                "company_industry_2" : "Distributor/Consumer",
                "company_industry_3" : "Manufacturing",
                "value_hoped_for" : "we hope to get a lot of value_1",
                "short_term_obj" : "short term objective_1",
                "long_term_obj" : "long term objective_1", 
                "pressing_problems" : "talent and capital_1", 
                "best_medium" : "Whatsapp",
                "internet_access" : "Daily"
            }
            
            request(url)
                .get('/companies/id')
                .send(company)
                .end(function(err, res) {
                    if (res.body.success == true) {
                        request(url)
                            .put('/companies/' + res.body.id)
                            .send(company)
                            .end(function(err2, res2) {
                                console.log(res2.body.message);
                                res2.body.success.should.equal(true);
                                done();
                            });
                    }
                });

        });

        it('tests that company cannot change id', function(done) {
            // Have to figure out ID first from business_name
             var  company = {
                "business_name" : "test_second",
                "id": "eeeeeeeeee"
            }
            
            request(url)
                .get('/companies/id')
                .send(company)
                .end(function(err, res) {
                    if (res.body.success == true) {
                        request(url)
                            .put('/companies/' + res.body.id)
                            .send(company)
                            .end(function(err2, res2) {
                                console.log(res2.body.message);
                                res2.body.success.should.not.equal(true);
                                done();
                            });
                    }
                });


        });

        it('tests that volunteer cannot change business_name', function(done) {
            // Have to figure out ID first from business name
            var company = {
                "business_name" : "test_second",
            }
            
            request(url)
                .get('/companies/id')
                .send(company)
                .end(function(err, res) {
                    if (res.body.success == true) {
                        company.business_name = "change@gmail.com";
                        request(url)
                            .put('/companies/' + res.body.id)
                            .send(company)
                            .end(function(err2, res2) {
                                console.log(res2.body.message);
                                res2.body.success.should.not.equal(true);
                                done();
                            });
                    }
                });


        });

    });

});

