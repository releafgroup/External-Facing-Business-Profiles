var exports = module.exports = {};

/**
 * route middleware to ensure user is logged in
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
exports.isLoggedIn = function (req, res, next) {
    if (req.isAuthenticated())
        return next();
    return res.json({success: false, message: "Not logged in"});
};

/**
 * Checks that a session is defined and the signed in user is type volunteer
 * @param req
 * @param res
 * @returns {boolean}
 */
exports.checkUserProfilePermission = function (req, res) {
    return !(typeof req.session.passport.user === 'undefined' || req.session.passport.user === null
    || req.session.passport.user.type != "volunteer");
};