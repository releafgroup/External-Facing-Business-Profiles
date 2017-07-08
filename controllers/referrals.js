const jsendResponse = require('../helpers/jsend_response');
const Referral = require('../models/referrrals');
const BusinessOwner = require('../models/business_owner');

module.exports = {
    create: (req, res) => {
        const businessOwnerId = req.params.id;
        let requestParams = req.body;
        BusinessOwner.findById({_id: businessOwnerId}, (err, businessOwner) => {
            if (err) {
                return jsendResponse.sendError('Something went wrong', 400, res)
            }
            if (!businessOwner) {
                return jsendResponse.sendError('Business Owner not found', 404, res);
            }

            let referral = new Referral(requestParams);
            referral.owner = businessOwnerId;
            referral.save().then(() => {
                return jsendResponse.sendSuccess(referral.toObject(), res);
            }).catch((err) => {
                return jsendResponse.sendError(err.message, 400, res);
            });
        });
    }
};
