const mongoose = require('mongoose'),
    Schema = mongoose.Schema;

let PreferenceSchema = new Schema({
    "investor_id": {type: Number, required: true},
    "prefs": {}
}, {collection: 'preferences'});

PreferenceSchema.pre('save', function (next) {
    let current_date = new Date();
    this.updated_at = current_date;

    if (!this.created_at) this.created_at = current_date;
    return next();
});

module.exports = mongoose.model('Preference', PreferenceSchema);