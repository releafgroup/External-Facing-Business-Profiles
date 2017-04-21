const Joi = require('joi');

const schema = Joi.object().keys({
    investor_email: Joi.string().required(),
    body: Joi.string().required(),
    subject: Joi.string().required(),
    business_email: Joi.string().email().required()
});

module.exports = function (data, cb) {
    schema.validate(data, {abortEarly: false}, cb);
};