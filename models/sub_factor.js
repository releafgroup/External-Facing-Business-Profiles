const mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var SubFactorSchema = new Schema({
    "sub_factor": {type: String, required: true},
    "sub_factor_label": {type: String, required: true},
    "factor": {type: String, required: true},
    "factor_label": {type: String, required: true},
    "weight": {type: Number, required: true},
    "score_1_rating": {type: Number, required: true},
    "score_1_label": {type: String, required: true},
    "score_2_rating": {type: Number, required: true},
    "score_2_label": {type: String, required: true},
    "score_3_rating": {type: Number, required: true},
    "score_3_label": {type: String, required: true},
    "score_4_rating": {type: Number, required: true},
    "score_4_label": {type: String, required: true},
    "score_5_rating": {type: Number, required: true},
    "score_5_label": {type: String, required: true}
}, {collection: 'sub_factors'});


module.exports = mongoose.model('SubFactor', SubFactorSchema);