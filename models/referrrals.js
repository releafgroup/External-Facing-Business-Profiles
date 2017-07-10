/**
 * Module dependencies.
 */
const mongoose = require('mongoose'),
    Schema = mongoose.Schema;
require('mongoose-type-email');

/**
 * Referrals Schema
 */
const ReferralSchema = new Schema({
    owner: {
        type: Schema.ObjectId,
        ref: 'BusinessOwner',
        required: true,
    },
    email: {type: mongoose.SchemaTypes.Email},
    recipient_name: {type: String, required: true},
    phone_number: {type: String, required: true},
    message: String,
    created_at: {type: Date, default: Date.now}
}, {collection: 'referrals'});

ReferralSchema.pre('save', (next) => {
    let now = new Date();
    if (!this.createdAt) {
        this.created_at = now;
    }
    next();
});

module.exports = mongoose.model('ReferralSchema', ReferralSchema);