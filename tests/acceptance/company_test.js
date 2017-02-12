const request = require('supertest');
const should = require('should');
const config = require('../../config/config');

const URL = config.tests.TEST_URL;

describe('Company', function () {
    it('Test Get Companies', (done) => {
        request(URL).get('/companies?business_model=0.009708737864077669&growth_plan=0.019417475728155338&legal_factor=0.1941747572815534&financial_factor=0.1941747572815534&market_factor=0.1941747572815534&team_factor=0.1941747572815534&social_factor=0.1941747572815534')
            .expect(200)
            .end(function (err, res) {
                res.body.status.should.equal('success');
                done();
            });
    });
});
