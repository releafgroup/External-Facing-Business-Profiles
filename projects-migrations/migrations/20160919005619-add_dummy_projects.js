'use strict';

module.exports = {

  up: function (db, next) {
    // TODO write your migration here
    db.collection('projects').insert({}, {$set: {blacklisted: true}}, next);
    next();
  },

  down: function (db, next) {
    // TODO write the statements to rollback your migration (if possible)
    next();
  }

};