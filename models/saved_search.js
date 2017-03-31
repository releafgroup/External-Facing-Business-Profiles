const mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var SavedSchema = new Schema({
	"user_id": {type: String, required: true},
	"title": {type: String, required: true},
	"description": {type: String, required: true},
	"link": {type: String, required: true},
	"created_at": {type: Date, required: true},
},{collection: 'sub_factors'});

module.exports = mongoose.model('SavedSchema', SavedSchema);