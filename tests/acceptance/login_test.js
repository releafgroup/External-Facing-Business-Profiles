const request = require('supertest');
const should = require('should');
const config = require('../../config/config');

const URL = config.tests.TEST_URL;

//disabling tests unto we figure out a way to test with MySQL
/*describe('Login', function () {
    it('Test Login Fails with Invalid Creds', (done) => {
        request(URL).post('/login')
            .send({password: 'password', email: 'username'})
            .expect(400)
            .end(function (err, res) {
                res.body.status.should.equal('fail');
                done();
            });
    });

    it('Test Login Success with Valid Creds', (done) => {
        request(URL).post('/login')
            .send({password: '93bce56c', email: 'yemi@mailinator.com'})
            .expect(200)
            .end(function (err, res) {
                res.body.status.should.equal('success');
                done();
            });
    });
});*/
