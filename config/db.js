const mongoose = require('mongoose');
const chalk = require('chalk');
const config = require('./config');

module.exports = function () {
    /**
     * Connect to MongoDB.
     */
    mongoose.Promise = global.Promise;
    if (process.env.TEST) {
        mongoose.connect(config.database.MONGODB_TEST_URI, () => {
            /* Drop the DB */
            mongoose.connection.db.dropDatabase();
        });
    } else {
        mongoose.connect(config.database.MONGODB_URI);
    }
    mongoose.connection.on('connected', () => {
        console.log('%s MongoDB connection established!', chalk.green('✓'));
    });
    mongoose.connection.on('error', () => {
        console.log('%s MongoDB connection error. Please make sure MongoDB is running.', chalk.red('✗'));
        process.exit();
    });
};