var mongoose = require('mongoose');
var config = require('../config.js');
var secret = require('../secret');
var Browser = require('zombie');
var HOST_DOMAIN = process.env.HOST_DOMAIN || 'http://localhost:3000';

var url = HOST_DOMAIN;
Browser.localhost(url, 2000);

// This is skipped because it causes the automated tests to fail now
// There is currently an issue with the facebook account used for tests
// This would be enabled when the issues with the account is resolved.

describe.skip('Facebook Login', function () {
    var TestBrowser = new Browser();

    before(function (done) {
        // Use mocha test db
        mongoose.connect(config.mocha_database, function () {
            /* Drop the DB */
            mongoose.connection.db.dropDatabase();
        });
        done();
    });

    describe('logs into facebook', function () {
        this.timeout(200000);
        before(function () {
            return Promise.resolve(TestBrowser.visit(url + '/users/auth/facebook/login')).then(function () {
                return TestBrowser.fill('email', secret.facebook.fbEmail)
                    .fill('pass', secret.facebook.fbPassword)
                    .pressButton('Log In');
            });
        });

        it('should complete successfully', function () {
            TestBrowser.assert.success();
        });

        it('gets user data', function (done) {

            TestBrowser.visit(url + '/users', function () {
                var bodyContent = JSON.parse(TestBrowser.document.body._childNodes[0]._data);
                bodyContent.message.facebook.should.have.property('id');
                bodyContent.message.skills.length.should.equal(0);
                done();
            });
        });

        it('can logout', function (done) {
            TestBrowser.visit(url + '/users/auth/logout', function () {
                var bodyContent = JSON.parse(TestBrowser.document.body._childNodes[0]._data);
                bodyContent.message.should.equal('logged out');
                done();
            });
        });

        it('can not access user data after logging out', function (done) {
            TestBrowser.visit(url + '/users/', function () {
                var bodyContent = JSON.parse(TestBrowser.document.body._childNodes[0]._data);
                bodyContent.message.should.equal('Not logged in');
                done();
            });
        });
    });
});
