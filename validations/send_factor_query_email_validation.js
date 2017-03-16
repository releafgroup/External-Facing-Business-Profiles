const Joi = require('joi');

const schema = Joi.object().keys({
    business_name: Joi.string().required(),
    investor_name: Joi.string().required(),
    investor_company: Joi.string().required(),
    business_email: Joi.string().email().required()
});

module.exports = function (data, cb) {
    schema.validate(data, {abortEarly: false}, cb);
};