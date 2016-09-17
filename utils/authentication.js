var jwt = require('jsonwebtoken');
var superSecret = require('../config.js').superSecret; 
module.exports = function(req, res, next) {

  // check header or url parameters or post parameters for token
  var token = req.body.token || req.query.token || req.headers['x-access-token'];

  // decode token
  if (token) {

    // verifies secret and checks exp
    jwt.verify(token, superSecret, function(err, decoded) {      
      if (err) {
        console.log(err.message);
         res.status(400); 
        return res.json({ success: false, message: 'Failed to authenticate.' });   
      } else {
        // if everything is good, save to request for use in other routes
        req.decoded = decoded;    
        next(); // make sure we go to the next routes and don't stop here
      }
    });

  } else {

    // if there is no token
    // return an HTTP response of 403 (access forbidden) and an error message
    return res.status(403).send({ 
      success: false, 
      message: 'No token provided. Include token in the body, as query string or as part of headers with "x-access-token"' 
    });
    
  }
}; 
