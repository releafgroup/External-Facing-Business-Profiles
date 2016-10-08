var User = require('../models/user.js');
var Project = require('../models/project.js');
var Admin = require('../models/admin.js');
var awsS3 = require('../helpers/aws_s3');
var base64Utils = require('../helpers/base_64');
var responseUtils = require('../helpers/response');


/** Function for user error handling in saving user info
 * @params: error from saving a user
 * Output: parsed error message
 */
function handleUserSaveError(err) {
    // Check if email already exists
    if (err.code == 11000) {
        err.message = "A user with that email already exists";
    } else {
        // If user validation, gets one of the errors to return
        if (err.message == "User validation failed") {
            var one_error;
            for (var first in err.errors) { // Get one of the errors
                one_error = err.errors[first];
                break;
            }
            // If it is one of the required ones i.e. Path 'XXXX' is required we change it to just XXXX is required
            if (/ is required/.test(one_error.message)) {
                one_error.message = one_error.message.replace(/^Path /gi, '');
            }
            err.message = one_error.message;
        }
    }
    return err.message;
}

var exports = module.exports = {};

/** Checks if a given email is associated with a user id
 * @params: email, req, res
 * Output: If successful, {success: true}
 * If not, {success: false, message: error_message}
 */
exports.checkIfEmailExists = function (email, req, res) {
    User.findOne({'local.email': email}, function (err, user) {
        // if there are any errors, return the error
        if (err)
            return res.json({success: false, message: err.message});
        // if no user is found, return the message
        if (!user)
            return res.json({success: false, message: "no user"});
        return res.json({success: true});
    });
};


/** Gets information for given User id
 * @params: user_id, req, res
 * Output: If successful, {success: true, message : user_info}
 * If not, {success: false, message: error_message}
 * Possible errors are: User not found and networking issues
 */
exports.getUserById = function (user_id, req, res) {
    User.findOne({
        '_id': user_id
    }, function (err, user) {
        if (!user) return res.json({success: false, message: 'User not found'});
        if (err) return res.json({success: false, message: err.message});

        return res.json({success: true, message: user});
    });
};

/** Updates information for given User id
 * @params: user_id, req, res
 * Output: If successful, {success: true}
 * If not, {success: false, message: error_message}
 * Possible errors are attempting to modify the email or user_id and deleting a required element
 */
exports.updateUserById = function (user_id, req, res) {
    User.findOne({
        '_id': user_id
    }, function (err, user) {
        if (!user) return res.json({success: false, message: 'User not found'});
        if (err) return res.json({success: false, message: err.message});
        for (var a in req.body) {
            var value = req.body[a];
            if (a !== "id" && a !== 'local.email' && a !== "_id" && a !== 'facebook.id') {
                if (a === "local.password") {
                    if ((value.length < 8 || value.length > 64)) {
                        return res.json({success: false, message: "Password not valid"}); // TODO: move to user.js
                    }
                    value = user.generateHash(value);
                }
                user.setItem(a, value);
            } else if (a === 'local.email') {
                if (value !== user.getItem(a)) return res.json({
                    success: false,
                    message: "You cannot modify the email"
                });
            } else if (a === 'facebook.id') {
                if (value !== user.getItem(a)) return res.json({
                    success: false,
                    message: "You cannot modify the facebook id"
                });
            } else {
                if (user.getItem(a) !== value) return res.json({
                    success: false,
                    message: "You cannot modify the id"
                }); // TODO: check
            }
        }
        user.save(function (err) {
            if (err) {
                return res.json({success: false, message: handleUserSaveError(err)});
            }
            if (user.signupType !== 'local') {
                user.fullUserFormSumitted = true
            }
            if (!req.body.profile_photo_data && !(req.body.resume_data && req.body.resume_extension)) {
                return res.json({success: true});
            } else {
                exports.uploadMedia(req.body.profile_photo_data, 'profile_photos', 'jpg',
                    'profile_photo', user, function () {
                        if (req.body.resume_data && req.body.resume_extension) {
                            exports.uploadMedia(req.body.resume_data, 'resumes', req.body.resume_extension,
                                'resume', user, function () {
                                    return res.json({success: true});
                                });
                        } else {
                            return res.json({success: true});
                        }
                    });
            }
        });
    });
};

/** Gets all Users
 * @params: req, res
 * Output: If successful, {success: true, message: list_of_users}
 * If not, {success: false, message: error_message}
 */
exports.getAllUsers = function (req, res) {

    User.find(function (err, users) {
        if (err) return res.json({success: false, message: err.message});
        res.json({success: true, message: users});
    });

};

exports.getAdminById = function (admin_id, req, res) {
    Admin.findOne({'_id': admin_id}, function(err, admin){
        if (err) return res.json({success: false, message: err.message});
        return res.json({success: true, message: admin});
    })
}

exports.getAllAdmin = function(req, res) {
    Admin.find(function (err, admin) {
        if (err) return res.json({success: false, message: err.message});
        return res.json({success: true, message: admin});
    });
}


/** Toggles the favorite attribute for a given user
 * @params: project_id, req, res
 * If users favorite attribute is equal to project_id, then the user does not have a favorite anymore
 * Else the favorite becomes project id
 * Output: If successful, {success: true}
 * If not, {success: false, message: error_message}
 */
exports.favoriteProjectById = function (project_id, req, res) {

    Project.findOne({'_id': project_id}, function (err, proj) {

        if (err) {
            return responseUtils.sendError(err.message, 500, res);
        }
        if (!proj) {
            return responseUtils.sendError('no project', 404, res);
        }

        User.findOne({
            '_id': req.session.passport.user.id
        }, function (err2, user) {

            if (err2) {
                return responseUtils.sendError(err2.message, 500, res);
            }

            if (!user) {
                return responseUtils.sendError('no user', 404, res);
            }

            if (user.favorite == project_id) { // Project is currently favored ... make it unfavorited
                user.favorite = undefined;
            } else {
                user.favorite = proj;
            }

            user.save(function (user_err, succ) {
                if (user_err)  {
                    return responseUtils.sendError('error occurred saving', 500, res);
                }
                return res.json({success: true});
            });
        });
    });
};

/** Returns a given user's favorited project
 * @params: user_id, req, res
 * Output: If successful, {success: true, message: user.favorite}
 * If not, {success: false, message: error_message}
 */
exports.getUserFavoriteProject = function (user_id, req, res) {
    User.findOne({
        '_id': user_id
    }).populate('favorite').exec(function (err, user) {
        if (!user) return res.json({success: false, message: 'User not found'});
        if (err) return res.json({success: false, message: err.message});
        return res.json({success: true, message: user.favorite});
    });
};

exports.uploadMedia = function (data, folderName, extension, field, newUser, successCallback) {
    // TODO Handle upload failures
    var file = data;
    var mimeType = base64Utils.getMimeType(file);

    var buf = new Buffer(base64Utils.getData(file), 'base64');
    var environment = process.env.APPLICATION_ENV;
    var filename = environment + '/' + folderName + '/' + newUser._id + '.' + extension;

    awsS3.upload({
        Key: filename,
        Body: buf,
        ContentEncoding: 'base64',
        ContentType: mimeType,
        ACL: 'public-read'
    }, function (err) {
        if (!err) {
            newUser.setItem(field, awsS3.getUrl(filename));
            newUser.save().then(function () {
                successCallback();
            });
        } else {
            successCallback();
        }
    });
};