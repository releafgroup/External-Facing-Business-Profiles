const mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var RequestMore = new Schema({

	"investor_email": {type: String, required: true},

	"body": {type: String, required: true},

	"subject": {type: String, required: true},

	'business_email': {type: String, required: true},

	"created_at": {type: Date},

	"updated_at": {type: Date}

},{collection: 'investor_requests_more'});

RequestMore.pre('save',function(next){
	var current_date = new Date();
	this.updated_at = current_date;

	if(!this.created_at) this.created_at = current_date;
	return next();
});

module.exports = mongoose.model('RequestMore', RequestMore);