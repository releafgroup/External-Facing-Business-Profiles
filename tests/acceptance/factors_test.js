const request = require('supertest');
const should = require('should');
const config = require('../../config/config');

const URL = config.tests.TEST_URL;

describe('Factors', function () {
    it('Test Get Factors', (done) => {
        request(URL).get('/factors')
            .expect(200)
            .end(function (err, res) {
                res.body.status.should.equal('success');
                done();
            });
    });

    it('Test Get Factors Queries', (done) => {
        request(URL).get('/factors/legal_factor/queries')
            .expect(200)
            .end(function (err, res) {
                res.body.status.should.equal('success');
                done();
            });
    });
});
