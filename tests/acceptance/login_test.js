const request = require('supertest');
const should = require('should');
const config = require('../../config/config');

const URL = config.tests.TEST_URL;

describe('Login', function () {
    it('Test Login Fails with Invalid Creds', (done) => {
        request(URL).post('/login')
            .send({password: 'password', username: 'username'})
            .expect(400)
            .end(function (err, res) {
                res.body.status.should.equal('fail');
                done();
            });
    });
});
