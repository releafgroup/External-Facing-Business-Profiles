const dotenv = require('dotenv');

/**
 * Load environment variables from .env file, where API keys and passwords are configured.
 */
dotenv.load({path: __dirname + '/../env/.env'});

module.exports = Object.freeze({
    APPLICATION_ENV: process.env.APPLICATION_ENV,
    database: {
        MONGODB_URI: process.env.MONGODB_URI,
        MONGODB_TEST_URI: process.env.MONGODB_TEST_URI
    },
    tests: {
        TEST_URL: process.env.TEST_URL
    },
    socket: {
        protocol: process.env.SOCKET_PROTOCOL || 'http',
        host: process.env.SOCKET_HOST || 'localhost',
        port: process.env.SOCKET_PORT || 6464
    }
});