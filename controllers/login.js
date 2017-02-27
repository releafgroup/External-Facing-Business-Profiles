const Investor = require('../models').Investor;
const UserCredential = require('../models').UserCredential;
const jsendRepsonse = require('../helpers/jsend_response');
const sha1 = require('locutus/php/strings/sha1');

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
                        return jsendRepsonse.sendSuccess(investor, res);
                    });
                    
            }).catch(function (err) {
            return jsendRepsonse.sendError(err.message, 500, res);
        });
    }
};