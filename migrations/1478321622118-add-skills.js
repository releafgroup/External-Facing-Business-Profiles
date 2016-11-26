'use strict'

var runMongoCommand = require('../utils/db');
var skills = require('../data/skills.json');
exports.up = function (next) {

    runMongoCommand(function (err, db) {
        var collection = db.collection('options');
        collection.insertMany(skills, function (err) {
            if (!err) {
                next();
                db.close();
            }
            db.close();
        });
    });
};

exports.down = function (next) {
    runMongoCommand(function (err, db) {
        var collection = db.collection('options');
        collection.remove({key: 'skills'}, function (err) {
            if (!err) {
                db.close();
                next();
            }
            db.close();
        });
    });
};