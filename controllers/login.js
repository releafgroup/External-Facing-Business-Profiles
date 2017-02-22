const Investor = require('../models').Investor;
const UserCredential = require('../models').UserCredential;
const jsendRepsonse = require('../helpers/jsend_response');
const sha1 = require('locutus/php/strings/sha1');
const config = require('../config/config');
const jwt    = require('jsonwebtoken');

module.exports = {
    authenticate: (req, res) => {
        var body = req.body;
        UserCredential.findOne({where: {password: sha1(body.password), email: body.email}, attributes: ['id', 'email']})
            .then(function (user) {
                if (!user) {
                    return jsendRepsonse.sendFail('Invalid username or password', 400, res);
                }

                Investor.findOne({where: {id: user.id}, attributes: ['id', 'website']})
                    .then(function (investor) {
                        if (!investor) {
                            return jsendRepsonse.sendError('Investor not found!', 404, res);
                        }
                        investor.email = user.email;
                        var investorCopy = investor;
                        investorCopy.token = jwt.sign(investor, config.SECRET, {
                            expiresIn: "2 days" // expires in 48 hours
                        });
                        return jsendRepsonse.sendSuccess(investorCopy, res);
                    });
                    
            }).catch(function (err) {
            return jsendRepsonse.sendError(err.message, 500, res);
        });
    }
};