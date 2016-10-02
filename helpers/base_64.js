var exports = module.exports = {};

/**
 * Returns the mime type from a base64 string
 * @param encoded
 * @returns {*}
 */
exports.getMimeType = function (encoded) {
    var result = null;
    if (typeof encoded !== 'string') {
        return result;
    }
    var mime = encoded.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/);
    if (mime && mime.length) {
        result = mime[1];
    }
    return result;
};

/**
 * Returns the actual data from a base 64 string
 * @param encoded
 * @returns {string|XML|void}
 */
exports.getData = function (encoded) {
    return encoded.replace(/^data:image\/\w+;base64,/, "");
};