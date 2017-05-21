const jsendResponse = require('../helpers/jsend_response');
const currency = require('y-currency');

module.exports = {
    convertMoney: (req, res) => {
        let requestParams = req.params;
        let value = Number(requestParams.value);
        let to = '';
        let from = requestParams.from;
        if (from == 'USD') {
            to = 'NGN';
        } else {
            to = 'USD';
        }
        currency.convert(value, from, to, function (err, converted) {
            if (err) {
                return jsendResponse.sendError('Not Converted', 500, res);
            } else {
                return jsendResponse.sendSuccess(converted, res);
            }
        });
    }
};