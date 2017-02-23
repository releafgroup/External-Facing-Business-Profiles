/**
 * Properly formats and sends JSEND responses
 */
module.exports = {
    sendSuccess: (data, res) => {
        console.log(data);
        return res.json({status: 'success', data: data});
    },
    sendError: (message, status, res) => {
        res.status(status);
        return res.json({status: 'error', message: message});
    },
    sendFail: (message, status, res) => {
        res.status(status);
        return res.json({status: 'fail', message: message});
    }
};