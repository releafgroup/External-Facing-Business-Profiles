const passport = require('passport');
const mongoose = require('mongoose');
const User = require('../models/business_owner');
const jsendResponse = require('../helpers/jsend_response');
const nodeMailer = require('../libs/node_mailer');

module.exports.register = (req, res) => {

    const user = new User();

    user.name = req.body.name;
    user.email = req.body.email;

    user.setPassword(req.body.password);

    user.save(function (err) {
        if (err) return jsendResponse.sendError('Email already exist', 400, res);
        var data = {}
        data.token = user.generateJwt();
        return jsendResponse.sendSuccess(data, res);
    });
};


module.exports.login = (req, res) => {

    passport.authenticate('local', (err, user, info) => {

        // If Passport throws/catches an error
        if (err) {
            return jsendResponse.sendError('Something went wrong', 401, info);
        }

        // If a user is found
        if (user) {
            const data = {
                token: user.generateJwt(),
                id: user._id,
                name: user.name,
                email: user.email
            };
            return jsendResponse.sendSuccess(data, res)
        } else {
            // If user is not found
            return jsendResponse.sendError('User not found', 404, res);
        }
    })(req, res);

};

module.exports.findAll = (req, res) => {
    User.find({}, (err, users) => {
        if (err) {
            return jsendResponse.sendError('Something went wrong', 404, res)
        }

        if (users) return jsendResponse.sendSuccess(users, res);
    })
};

