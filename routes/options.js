var express = require('express'),
    router = express.Router(),
    optionFunctions = require('../utils/option');

router.route('/').get(function (req, res) {
    var field = req.query.field;
    if (field) {
        optionFunctions.getAllByKey(field, res);
    } else {
        optionFunctions.getAll(req, res);
    }
});

module.exports = router;