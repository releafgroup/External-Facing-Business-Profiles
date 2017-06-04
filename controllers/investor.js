const jsendResponse = require('../helpers/jsend_response');
const SubFactor = require('../models/sub_factor');
const Preference = require('../models/preference');
const Investor = require('../models').Investor;

module.exports = {
    savePreference: (req, res) => {
        let requestParams = req.body;
        let investorId = req.params.investorId;
        Investor.findOne({where: {id: investorId}, raw: true, attributes: ['id']}).then((investor) => {
            if (!investor) {
                return jsendResponse.sendError("Investor not found", 404, res);
            }

            SubFactor.find().distinct('factor').then(function (factors) {
                let data = {
                    investor_id: investorId
                };
                Object.keys(requestParams).forEach((factor) => {
                    if (factors.indexOf(factor) !== -1) {
                        if (typeof data['prefs'] === 'undefined') {
                            data['prefs'] = {};
                        }
                        data['prefs'][factor] = requestParams[factor];
                    }
                });
                if (Object.keys(data).length === 1) {
                    return jsendResponse.sendError("No factor preferences found", 400, res);
                }
                Preference.findOne({'investor_id': investorId}).then((investorPreference) => {
                    if (!investorPreference) {
                        investorPreference = new Preference(data);
                    } else {
                        investorPreference.prefs = data.prefs;
                    }
                    investorPreference.save().then(() => {
                        return jsendResponse.sendSuccess(true, res);
                    }).catch((err) => {
                        return jsendResponse.sendError(err.message, 400, res);
                    });
                }).catch((err) => {
                    return jsendResponse.sendError(err.message, 500, res);
                });
            });
        }).catch((err) => {
            return jsendResponse.sendError(err.message, 500, res);
        });
    },
    getPreference: (req, res) => {
        let investorId = req.params.investorId;
        Preference.findOne({'investor_id': investorId}).then((investorPreference) => {
            if (!investorPreference) {
                return jsendResponse.sendError("Preference not found", 404, res);
            }
            return jsendResponse.sendSuccess(investorPreference, res);
        }).catch((err) => {
            return jsendResponse.sendError(err.message, 500, res);
        });
    }
};