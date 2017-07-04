const request = require('supertest');
const should = require('should');
const config = require('../../config/config');
const User = require('../../models/business_owner');

const URL = config.tests.TEST_URL;

describe('Business Owner', function () {

    const user1 = {
        company_name: 'kenny chan ltd',
        email: 'kenny@example.com',
        password: 'password'
    };
    it('registers business owners', (done) => {

        request(URL)
            .post('/businesses')
            .set('Content-Type', 'application/json')
            .send(user1)
            .expect(200)
            .end(function (err, res) {
                res.body.status.should.equal('success');
                done();
            });
        
    });

    it('should not registers if email already exists', (done) => {

        request(URL)
            .post('/businesses')
            .set('Content-Type', 'application/json')
            .send(user1)
            .expect(400)
            .end(function (err, res) {
                res.body.status.should.equal('error');
                done();
            });
        
    });

    it('should login business owners' , (done) => {
        const body = {
            email: 'kenny@example.com',
            password: 'password'
        }
        request(URL)
            .post('/businesses/sessions')
            .set('Content-Type', 'application/json')
            .send(body)
            .expect(200)
            .end(function (err, res) {
                res.body.status.should.equal('success');
                done();
            });
    });

    it('should not login unknown business owners', (done) => {
        const body = {
            email: 'tayor@mail.com',
            password: 'password'
        }
        request(URL)
            .post('/businesses/sessions')
            .set('Content-Type', 'application/json')
            .send(body)
            .expect(404)
            .end(function (err, res) {
                res.body.status.should.equal('error');
                done();
            });
    });

    it('Get all business owners', (done) => {
        request(URL)
            .get('/businesses')
            .set('x-access-token', config.ADMIN_SECRET_KEY)
            .expect(200)
            .end(function (err, res) {       
                res.body.status.should.equal('success');
                done();
            });
    });

    it('should not get user without admin access', (done) => {
        request(URL)
            .get('/businesses')
            .expect(400)
            .end(function (err, res) {    
                res.body.status.should.equal('error');
                done();
            });
    });
});
