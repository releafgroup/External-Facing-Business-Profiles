const Investor = require('../models').Investor;
const jsendRepsonse = require('../helpers/jsend_response');
const sha1 = require('sha1');

module.exports = {
    authenticate: (req, res) => {
        var body = req.body;
        Investor.findOne({where: {password: sha1(body.password), email: req.email}}).then(function (investor) {
            if (!investor) {
                return jsendRepsonse.sendFail('Invalid username or password', 400, res);
            }
            return jsendRepsonse.sendSuccess(investor, res);
        }).catch(function (err) {
            return jsendRepsonse.sendError(err.message, 500, res);
        });
    }
};