const request = require('supertest');
const should = require('should');
const config = require('../../config/config');

const URL = config.tests.TEST_URL;

describe('SavedSearch', function () {

    it('Test Create SavedSearch', (done) => {
        request(URL).post('/saved-search')
        .set('x-access-token', config.ADMIN_SECRET_KEY)
            .send({
            "user_id":"1",
            "title":"demo",
            "description":"demo",
            "link":"demo"
            })
            .expect(200)
            .end(function (err, res) {
                res.body.status.should.equal('success');
                done();
            });
    });


    it('Test Get SavedSearch', (done) => {
        request(URL).get('/saved-search/1')
        .set('x-access-token', config.ADMIN_SECRET_KEY)
            .expect(200)
            .end(function(err, res){
                res.body.status.should.equal('success');
                done();
            })
    });

});