const request = require('supertest');
const should = require('should');
const config = require('../../config/config');

const URL = config.tests.TEST_URL;

describe('Company', function () {
    it('Test Get Companies', (done) => {
        request(URL).get('/companies')
            .set('x-access-token', config.ADMIN_SECRET_KEY)
            .expect(200)
            .end(function (err, res) {
                res.body.status.should.equal('success');
                done();
            });
    });

     it('Test Money Conversion', (done) => {
        request(URL).get('/companies/convertMoney?value=10000&from=NGN')
            .set('x-access-token', config.ADMIN_SECRET_KEY)
            .expect(200)
            .end(function (err, res) {
               res.body.status.should.equal('success');
                done();
            });
    });


    it('Test Search Companies',(done) => {
        request(URL)
        .get('/companies/search')
        .set('x-access-token', config.ADMIN_SECRET_KEY)
        .expect(200)
        .end(function (err, res) {
          //  console.log(res.body);
            res.body.status.should.equal('success');
            done();
        });
    })

});
