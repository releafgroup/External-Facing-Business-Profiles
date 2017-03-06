const mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var FactorQuerySchema = new Schema({
    "r_factor": {type: String, required: true},
    "content": {type: String, required: true},
    "type": {type: String, required: true},
    "weight": {type: Number, required: true},
}, {collection: 'factor_queries'});

module.exports = mongoose.model('FactorQuerySchema', FactorQuerySchema);