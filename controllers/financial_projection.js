const jsendResponse = require('../helpers/jsend_response');
const FinancialData = require('../models/financial_data');
const BusinessOwner = require('../models/business_owner');
const _ = require('lodash');

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

            let financialData = new FinancialData(requestParams);
            financialData.owner = businessOwnerId;
            financialData.save().then(() => {
                return jsendResponse.sendSuccess(financialData.toObject(), res);
            }).catch((err) => {
                return jsendResponse.sendError(err.message, 400, res);
            });
        });
    },
    get: (req, res) => {
        const id = req.params.id;

        FinancialData.findOne({owner: id}, (err, financialData) => {
            if (err) {
                return jsendResponse.sendError('Something went wrong', 400, res)
            }

            if (financialData) {
                return jsendResponse.sendSuccess(financialData, res);
            } else return jsendResponse.sendError('Financial data not found', 404, res);
        });
    },
    remove: (req, res) => {
        const businessOwnerId = req.params.id;

        FinancialData.findOneAndRemove({owner: businessOwnerId}, (err) => {
            if (err) {
                return jsendResponse.sendError('Something went wrong', 400, res)
            }
            return jsendResponse.sendSuccess(true, res);
        });
    },
    update: (req, res) => {
        const businessOwnerId = req.params.id;
        FinancialData.findOne({owner: businessOwnerId}, (err, financialData) => {
            if (err) {
                return jsendResponse.sendError('Something went wrong', 400, res)
            }

            if (financialData) {
                financialData = _.extend(financialData, req.body);
                return jsendResponse.sendSuccess(financialData, res);
            } else {
                return jsendResponse.sendError('Financial data not found', 404, res);
            }
        });
    }
};
