const mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var CompanySchema = new Schema({}, {collection: 'business_inputs', strict: false});

module.exports = mongoose.model('Company', CompanySchema);