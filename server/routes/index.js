var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.send({ title: 'Welcome to the ikeora API' }); // Changed to send since render was giving me trouble
});

module.exports = router;
