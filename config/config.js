const dotenv = require('dotenv');

/**
 * Load environment variables from .env file, where API keys and passwords are configured.
 */
dotenv.load({path: __dirname + '/../env/.env'});

module.exports = Object.freeze({
    APPLICATION_ENV: process.env.APPLICATION_ENV,
    database: {
        MONGODB_URI: process.env.MONGODB_URI,
        MONGODB_TEST_URI: process.env.MONGODB_TEST_URI,
        DB_HOST: process.env.DB_HOST,
        DB_NAME: process.env.DB_NAME,
        DB_PASSWORD: process.env.DB_PASSWORD,
        DB_USERNAME: process.env.DB_USERNAME
    },

    tests: {
        TEST_URL: process.env.TEST_URL
    },

    QUERY_LIMIT: 50,
    // to be changed before pushed to production
    ADMIN_SECRET_KEY: 'abcd',
    // to be changed before pushed to production
    SECRET: 'abcd',
    smtp: {
        pool: true,
        host: process.env.MAILER_HOST,
        port: process.env.MAILER_PORT,
        auth: {
            user: process.env.MAILER_SMTP_USER,
            pass: process.env.MAILER_SMTP_PASS
        }
    }
});