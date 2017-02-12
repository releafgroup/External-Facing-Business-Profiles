const request = require('supertest');
const should = require('should');
const config = require('../../config/config');

const URL = config.tests.TEST_URL;

describe('Factors', function () {
    it('Test Get Companies', (done) => {
        request(URL).get('/companies?business_model=0.5')
            .expect(200)
            .end(function (err, res) {
                res.body.status.should.equal('success');
                done();
            });
    });
});
