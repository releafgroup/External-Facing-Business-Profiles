const passport = require('passport');
const mongoose = require('mongoose');
const User = require('../models/business_owner');

module.exports.register = function (req, res) {

    var user = new User();

    user.name = req.body.name;
    user.email = req.body.email;

    user.setPassword(req.body.password);

    user.save(function (err) {
        var token;
        token = user.generateJwt();
        res.status(200);
        res.json({
            "token": token
        });
    });
};


module.exports.login = (req, res) => {

    passport.authenticate('local', (err, user, info) => {
        var token;

        // If Passport throws/catches an error
        if (err) {
            res.status(404).json(err);
            return;
        }

        // If a user is found
        if (user) {
            token = user.generateJwt();
            res.status(200);
            res.json({
                "token": token
            });
        } else {
            // If user is not found
            res.status(401).json(info);
        }
    })(req, res);

};

module.exports.findAll = (req, res) => {
    User.find({}, (err, users) => {
        if (err) {
            res.status(404).json(err);
            return;
        }

        if (users) res.status(200).json({users});
    })
};

module.exports.approve = (req, res) => {
    const id = req.params.id;

    User.findById({_id: id}, (err, user) => {
        if (err) {
            res.status(404).json(err);
            return;
        }

        if (user) {
            res.status(200).json({user});
        }
    })

};