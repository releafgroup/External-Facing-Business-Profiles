const mongoose = require('mongoose'),
    Schema = mongoose.Schema;

let WatchedCompanySchema = new Schema({
    "investor_id": {type: Number, required: true},
    "company_id": {type: Schema.Types.ObjectId, required: true}
}, {collection: 'watched_companies'});

WatchedCompanySchema.pre('save', function (next) {
    let current_date = new Date();
    this.updated_at = current_date;

    if (!this.created_at) this.created_at = current_date;
    return next();
});

module.exports = mongoose.model('WatchedCompany', WatchedCompanySchema);