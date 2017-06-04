const Joi = require('joi');

const schema = Joi.object().keys({
    'company_id': Joi.string().required()
});

module.exports = function (data, cb) {
    schema.validate(data, {abortEarly: false}, cb);
};