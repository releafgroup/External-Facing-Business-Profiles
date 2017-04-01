const mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var SavedSchema = new Schema({
	"user_id": {type: String, required: true},
	"title": {type: String, required: true},
	"description": {type: String, required: true},
	"link": {type: String, required: true},
	"created_at": {type: Date},
	"updated_at":{type: Date}
},{collection: 'sub_factors'});

SavedSchema.pre('save',function(next){
	var current_date = new Date();
	this.updated_at = current_date;

	if(!this.created_at) this.created_at = current_date;
	return next();
});

module.exports = mongoose.model('SavedSchema', SavedSchema);