const jsendRepsonse = require('../helpers/jsend_response');
module.exports = {
    index: (req, res) => {
        jsendRepsonse.sendSuccess(true, res);
    }
};