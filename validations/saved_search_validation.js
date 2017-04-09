const Joi = require('joi');

const schema = Joi.object().keys({
	'id': Joi.string(),
	'user_id': Joi.string().required(),
	'title': Joi.string().required(),
	'description': Joi.string().required(),
	'link': Joi.string().required()
});

module.exports = function(data, cb){
	schema.validate(data,{abortEarly: false}, cb);
}