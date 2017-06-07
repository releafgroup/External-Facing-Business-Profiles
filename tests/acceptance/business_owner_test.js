const request = require('supertest');
const should = require('should');
const config = require('../../config/config');
// const utils = require('./utils');

const URL = config.tests.TEST_URL;

describe('Business Owner', function () {

    const user1 = {
        name: 'Dej Jay',
        email: 'deji@example.com',
        password: 'password'
    };
    const user2 = {
        name: 'Tayo Jax',
        email: 'tayo@example.com',
        password: 'password'
    }
    it('registers business owners', (done) => {

        request(URL).post('/business-register')
            .set('Content-Type', 'application/json')
            .send(user1)
            .expect(200)
            .end(function (err, res) {
                res.status.should.equal(200);
                request(URL).post('/business-register')
                    .set('Content-Type', 'application/json')
                    .send(user2)
                    .expect(200)
                    .end(function (err, res) {
                        res.status.should.equal(200);
                        done();
                    });
                // done();
            });
        
    });

    it('approves business owners', (done) => {
        request(URL).post('/approve-business-owner/5938682270d3d5af878254c9')
           .set('x-access-token', config.ADMIN_SECRET_KEY)
            .set('Content-Type', 'application/json')
            .expect(200)
            .end(function (err, res) {
                res.status.should.equal(200);
                done();
            });
    });

    it('should login approved business owners', (done) => {
        const body = {
            email: 'deji@example.com',
            password: 'password'
        }
        request(URL).post('/business-login')
            .set('Content-Type', 'application/json')
            .send(body)
            .expect(200)
            .end(function (err, res) {
                res.status.should.equal(200);
                done();
            });
    });

    it('should not login unapproved business owners', (done) => {
        const body = {
            email: 'tayo@example.com',
            password: 'password'
        }
        request(URL).post('/business-login')
            .set('Content-Type', 'application/json')
            .send(body)
            .expect(401)
            .end(function (err, res) {
                res.status.should.equal(401);
                done();
            });
    });

    it('should not login unknown business owners', (done) => {
        const body = {
            email: 'tayo@mail.com',
            password: 'password'
        }
        request(URL).post('/business-login')
            .set('Content-Type', 'application/json')
            .send(body)
            .expect(404)
            .end(function (err, res) {
                res.status.should.equal(404);
                done();
            });
    });

    it('Get all business owners', (done) => {
        request(URL).get('/get-business-owners')
            .set('x-access-token', config.ADMIN_SECRET_KEY)
            .expect(200)
            .end(function (err, res) {       
                res.status.should.equal(200);
                done();
            });
    });

    it('should not get user without admin access', (done) => {
        request(URL).get('/get-business-owners')
            .expect(400)
            .end(function (err, res) {       
                res.status.should.equal(400);
                done();
            });
    });
});
