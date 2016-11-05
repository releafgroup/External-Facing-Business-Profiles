'use strict'

var runMongoCommand = require('../utils/db');
var data = require('../data/best_medium.json');
exports.up = function (next) {

  runMongoCommand(function (err, db) {
    var collection = db.collection('options');
    collection.insertMany(data, function (err) {
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
    collection.remove({key: 'best_medium'}, function (err) {
      if (!err) {
        db.close();
        next();
      }
      db.close();
    });
  });
};