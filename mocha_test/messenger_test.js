var request = require('supertest');
var mongoose = require('mongoose');
var config = require('../config.js');
var testHelpers = require('../helpers/test');

describe('Messenger Routes', function () {
    var agent = request.agent(testHelpers.url);
    before(function (done) {
        // Use mocha test db
        mongoose.connect(config.mocha_database, function () {
            /* Drop the DB */
            mongoose.connection.db.dropDatabase();
        });
        done();
    });

    it('Get Companies', function (done) {
        agent.get('/messenger/companies')
            .end(function (err, res) {
                res.body.success.should.equal(true);
                res.body.message.should.be.a.Array();
                done();
            });
    });

    it('Get Volunteers', function (done) {
        agent.get('/messenger/volunteers')
            .end(function (err, res) {
                res.body.success.should.equal(true);
                res.body.message.should.be.a.Array();
                done();
            });
    });
});