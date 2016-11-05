'use strict'

var runMongoCommand = require('../utils/db');
var data = require('../data/company_size.json');
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
    collection.remove({key: 'company_size'}, function (err) {
      if (!err) {
        db.close();
        next();
      }
      db.close();
    });
  });
};