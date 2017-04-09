const jwt       = require('jsonwebtoken');
const config 	= require('../config/config');
const jsendRepsonse = require('./jsend_response');

const auth 	= function(req,res,next){
    var token 	= req.body.token || req.query.token || req.headers['x-access-token'];
    var isAdmin = function() {
        return (config.ADMIN_SECRET_KEY == token);
    };

    if(isAdmin()){
        next();
        return;
    }
    // decode token
    if (token) {
        // verifies secret and checks exp
        jwt.verify(token, config.SECRET, function (err, decoded) {
            if (err) {
                return res.json({success: false, message: 'Failed to authenticate token.'});
            } else {
                if(req.method != 'GET'){
                    return jsendRepsonse.sendError("sorry you are not authorized to perform this operation",
                        400, res)
                }
                next();
            }
        });
    } else {
        return jsendRepsonse.sendError("sorry please you don't have access", 400, res);
    }
}

module.exports = auth;