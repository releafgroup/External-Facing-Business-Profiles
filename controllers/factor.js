const jsendResponse = require('../helpers/jsend_response');
const SubFactor = require('../models/sub_factor');
const FactorQuery = require('../models/factor_query');

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
        })
    },
    getFactorQueries: (req, res) => {
        FactorQuery.find({r_factor: req.params.factor}).then((queries) => {
            jsendResponse.sendSuccess(queries, res);
        }).catch((error) => {
            jsendResponse.sendError(error, 500, res);
        });
    }
};