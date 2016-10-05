var mongoose = require('mongoose');
var config = require('../config.js');
var secret = require('../secret');
var Browser = require('zombie');
var HOST_DOMAIN = process.env.HOST_DOMAIN || 'http://localhost:3000';

var url = HOST_DOMAIN;
Browser.localhost(url, 2000);

describe('Facebook Login', function() {
     var TestBrowser = new Browser();

    before(function(done) {
        // Use mocha test db
        mongoose.connect(config.mocha_database,function(){
            /* Drop the DB */
            mongoose.connection.db.dropDatabase();
        });
        done();
    });

    describe('logs into facebook', function() {
            this.timeout(20000);
            before(function() {
                return Promise.resolve(TestBrowser.visit(url + '/users/auth/facebook/login')).then(function() {
                    return TestBrowser.fill('email', secret.facebook.fbEmail)
                                    .fill('pass', secret.facebook.fbPassword)
                                    .pressButton('Log In');
                });
            });

            it('should complete successfully', function() {
                TestBrowser.assert.success();
            });

            it('gets user data', function(done) {
                var bodyContent = JSON.parse(TestBrowser.document.body.childNodes[0].innerHTML);
                bodyContent.message.facebook.should.have.property('id');
                bodyContent.message.skills.length.should.equal(0);
                done();
            });

            it('can logout', function(done) {
                TestBrowser.visit(url + '/users/auth/logout', function() {
                    var bodyContent = JSON.parse(TestBrowser.document.body.childNodes[0].innerHTML);
                    bodyContent.message.should.equal('logged out');
                    done();
                });
            });

            it('can not access user data after logging out', function(done) {
                TestBrowser.visit(url + '/users/', function() {
                    var bodyContent = JSON.parse(TestBrowser.document.body.childNodes[0].innerHTML);
                    bodyContent.message.should.equal('Not logged in');
                    done();
                });
            });
    });
});
