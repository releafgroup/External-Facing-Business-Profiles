const jsendResponse = require('../helpers/jsend_response');
const SubFactor     = require('../models/sub_factor');
const company       = require('../models/company');

module.exports = {
    getAll: (req, res) => {
        SubFactor.find().then((subFactors) => {
            const factors = {};
            subFactors.forEach((subFactor) => {
                const factor = subFactor.factor;
                if (!factors.hasOwnProperty(factor)) {
                    factors[factor] = {
                        label: subFactor.factor_label
                    };
                    factors[factor]['subfactors'] = [subFactor];
                } else {
                    factors[factor]['subfactors'].push(subFactor);
                }
            });
            jsendResponse.sendSuccess(factors, res);
        });
    },

    rFactor : (req, res) => {
        let requestParams = req.query;
        let businessType = requestParams['business_type'];
        SubFactor.find().distinct('factor').then((factors) => {
            let factorString = "";
            factors.forEach((factor) => {
                factorString += factor += " "
            });
            company.find({'business_type': businessType}).select(factorString).then((businessItems) => {
                let scores = {};
                businessItems.forEach((businessItem) => {
                    businessItem = businessItem.toObject();
                    factors.forEach((factor) => {
                        let currentFactor = factor;
                        if (businessItem.hasOwnProperty(currentFactor)) {
                            let currentScore = businessItem[currentFactor];
                            if (scores.hasOwnProperty(currentFactor)) {
                                scores[currentFactor] += currentScore;
                            } else {
                                scores[currentFactor] = currentScore;
                            }
                        } else {
                            scores[currentFactor] = 0;
                        }
                    });
                });

                let size = businessItems.length;

                for(key in scores) {
                    scores[key] /= size;
                    scores[key] = Math.round(scores[key]);
                }

                jsendResponse.sendSuccess(scores, res);
            });
        });


    }
};