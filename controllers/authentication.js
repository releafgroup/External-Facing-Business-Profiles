const passport = require('passport');
const mongoose = require('mongoose');
const User = require('../models/business_owner');
const jsendResponse = require('../helpers/jsend_response');

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
            if(user.isApproved) {
                token = user.generateJwt();
                res.status(200);
                res.json({
                    "token": token
                });
            } else {
                res.status(401).json({
                    "message": "You account is yet to be approved"
                })
            }
        } else {
            // If user is not found
            res.status(404).json(info);
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
            // var approvedUser = {}
            // approvedUser.isApproved = true;
            user.isApproved = true;
            user.save().then(function() {
                // Todo: send a mail after approval
                res.status(200);
                return res.json({
                    "user": user
                })
            }, function(err) {
                return res.status(400).json(err);
            });
            // res.status(200).json({user});
        }
    })

};