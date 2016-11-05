var request = require('supertest');
var mongoose = require('mongoose');
var config = require('../config.js');
var testHelpers = require('../helpers/test');

describe('Options Routes', function () {
    var agent = request.agent(testHelpers.url);
    before(function (done) {
        // Use mocha test db
        mongoose.connect(config.mocha_database, function () {
            /* Drop the DB */
            mongoose.connection.db.dropDatabase();
        });
        done();
    });

    it('Get All Options', function (done) {
        agent.get('/options')
            .end(function (err, res) {
                res.body.success.should.equal(true);
                res.body.options.should.be.a.Array();
                done();
            });
    });

    it('Get All Options By Key', function (done) {
        agent.get('/options?key=test')
            .end(function (err, res) {
                res.body.success.should.equal(true);
                res.body.options.should.be.a.Array();
                done();
            });
    });
});