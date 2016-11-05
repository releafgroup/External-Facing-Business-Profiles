var Option = require('../models/option'),
    responseHelper = require('../helpers/response');
var exports = module.exports = {};

/** Gets all Options
 * @params: req, res
 */
exports.getAll = function (req, res) {
    Option.find({}).then(function (options) {
        responseHelper.sendSuccessWithFullData({options: options}, res);
    }).catch(function (err) {
        responseHelper.sendError(err.message, 500, res);
    });
};

/**
 * Get Options by key / field
 */
exports.getAllByKey = function (key, res) {
    Option.find({key: key}).sort('+label').then(function (options) {
        responseHelper.sendSuccessWithFullData({options: options}, res);
    }).catch(function (err) {
        responseHelper.sendError(err.message, 500, res);
    });
};
