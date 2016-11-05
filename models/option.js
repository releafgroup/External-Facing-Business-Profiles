var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * Configurable dropdown options to be used on the FE
 */
var OptionSchema = new Schema({
    key: {type: String, required: true},
    label: {type: String, required: true},
    group: {type: String, required: false, default: "", index: true},
    is_active: {type: Boolean, required: false, default: true}
}, {
    timestamps: true
});

module.exports = mongoose.model('Option', OptionSchema);