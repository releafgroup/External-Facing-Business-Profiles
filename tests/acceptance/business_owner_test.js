const request = require('supertest');
const should = require('should');
const config = require('../../config/config');
const User = require('../../models/business_owner');

const URL = config.tests.TEST_URL;

describe('Business Owner', function () {

    const user1 = {
        name: 'Chun li',
        email: 'chun@example.com',
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

    it('approves business owners', (done) => {
        User.find({email: 'chun@example.com'}, function(err, user){
            request(URL)
            .post('/businesses/' + user[0]._id + '/approval')
            .set('x-access-token', config.ADMIN_SECRET_KEY)
            .set('Content-Type', 'application/json')
            .expect(200)
            .end(function (err, res) {
                res.body.status.should.equal('success');
                done();
            });
        })
        
    });

    it('approve should throw error if business owners is already approved', (done) => {
        User.find({email: 'chun@example.com'}, function(err, user){
            request(URL)
            .post('/businesses/' + user[0]._id + '/approval')
            .set('x-access-token', config.ADMIN_SECRET_KEY)
            .set('Content-Type', 'application/json')
            .expect(400)
            .end(function (err, res) {
                res.body.status.should.equal('error');
                done();
            });
        }) 
    });

    it('should login approved business owners' , (done) => {
        const body = {
            email: 'chun@example.com',
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
