const jsendRepsonse = require('../helpers/jsend_response');
const SubFactor = require('../models/sub_factor');
const Company = require('../models/company');

module.exports = {
    getAll: (req, res) => {
        var requestParams = req.query;
        var companies = [];
        SubFactor.find().then((subFactors) => {
            Company.find().then((companyInputs) => {
                for (var i = 0; i < companyInputs.length; i++) {
                    var companySubFactors = companyInputs[i].toObject();
                    var rScore = 0;
                    for (var j = 0; j < subFactors.length; j++) {
                        var subFactor = subFactors[j];
                        var companySubFactor = companySubFactors[subFactor.sub_factor];
                        const weight = Number(requestParams[subFactor.factor]) || subFactor.weight;
                        if (companySubFactor) {
                            const scoreRating = subFactor['score_' + companySubFactor.score + '_rating'];
                            const weightedScore = Number(weight) * Number(scoreRating);
                            rScore += weightedScore;
                            companySubFactors[subFactor.sub_factor].weighted_score = weightedScore;
                            companySubFactors[subFactor.sub_factor].score_rating = scoreRating;
                            console.log(scoreRating);
                            companySubFactors[subFactor.sub_factor].weight = weight;
                        }
                    }
                    companySubFactors.r_score = Math.floor(rScore);
                    companies.push(companySubFactors);
                }

                companies.sort(function (a, b) {
                    return parseFloat(a.r_score) - parseFloat(b.r_score);
                });

                var limit = requestParams.limit || ((companies.length > 5) ? 5 : companies.length);
                companies = (companies.length > 1) ? companies.slice(0, limit) : companies;
                return jsendRepsonse.sendSuccess(companies, res);
            });
        });
    },

    get: (req, res) => {
        if (!req.params.id) {
            return jsendRepsonse.sendError('Company not found', 404, res);
        }

        Company.findById(req.params.id, function (err, company) {
            if (!company) {
                return jsendRepsonse.sendError('Company not found', 404, res);
            }

            return jsendRepsonse.sendSuccess(company.toObject(), res);
        });
    }
};
