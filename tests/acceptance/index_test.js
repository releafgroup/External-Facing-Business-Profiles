const request = require('supertest');
const should = require('should');
const config = require('../../config/config');

const URL = config.tests.TEST_URL;

describe('Index', function () {
    it('Test Index Works', (done) => {
        request(URL).get('/')
            .send({})
            .expect(200)
            .end(function (err, res) {
                res.body.status.should.equal('success');
                res.body.data.should.equal(true);
                done();
            });
    });
});
