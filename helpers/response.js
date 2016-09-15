/**
 * Properly formats and sends API success and error responses
 */
module.exports = {
    sendSuccess: function (data, res) {
        return res.json({success: true, message: data});
    },
    sendSuccessWithFullData: function (data, res) {
        return res.json(Object.assign({success: true}, data));
    },
    sendError: function (message, status, res) {
        res.status(status);
        return res.json({success: false, message: message});
    }
};