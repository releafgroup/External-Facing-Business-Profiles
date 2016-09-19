'use strict';

// This is where you can configure migrate-mongo
module.exports = {
  // The mongodb collection where the applied changes are stored:
  changelogCollectionName: 'projects',
  mongodb: {
    // TODO edit this connection url to your MongoDB database:
    url: process.env.MONGODB_URI || 'mongodb://localhost/first_test_db'
  }
};