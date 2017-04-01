const request = require('supertest');
const should = require('should');
const config = require('../../config/config');

const URL = config.tests.TEST_URL;

describe('Company', function () {
    it('Test Get Companies', (done) => {
        request(URL).get('/companies?business_model=0.02')
            .set('x-access-token', config.ADMIN_SECRET_KEY)
            .expect(200)
            .end(function (err, res) {
                res.body.status.should.equal('success');
                done();
            });
    });

    // it('Test Get Company', (done) => {
    //     request(URL).get('/companies/589be08a341a018b0e2b0c42')
    //         .expect(200)
    //         .end(function (err, res) {
    //             res.body.status.should.equal('success');
    //             done();
    //         });
    // });

    it('Test Search Companies',(done) => {
        request(URL)
        .get('/companies/search')
        .set('x-access-token', config.ADMIN_SECRET_KEY)
        .expect(200)
        .end(function (err, res) {
            console.log(res.body);
            res.body.status.should.equal('success');
            done();
        });
    })

    describe('Login', function () {
    it('Test Login Fails with Invalid Creds', (done) => {
        request(URL).post('/save/search')
            .send({password: 'password', email: 'username'})
            .expect(400)
            .end(function (err, res) {
                res.body.status.should.equal('fail');
                done();
            });
    });

});
