var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * Configurable dropdown options to be used on the FE
 */
var OptionSchema = new Schema({
    key: {type: String, required: true},
    label: {type: String, required: true},
    group: {type: String, default: "", index: true},
    is_active: {type: Boolean, default: true}
}, {
    timestamps: true
});

module.exports = mongoose.model('Option', OptionSchema);