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
                    let rScore = 0;
                    let stats = {};
                    for (var j = 0; j < subFactors.length; j++) {
                        var subFactor = subFactors[j];
                        var companySubFactor = companySubFactors[subFactor.sub_factor];
                        const weight = Number(requestParams[subFactor.factor]) || (1 / subFactors.length);
                        if (companySubFactor) {
                            const scoreRating = subFactor['score_' + companySubFactor.score + '_rating'];
                            rScore += Number(weight) * companySubFactors[subFactor.sub_factor].weighted_score;
                            companySubFactors[subFactor.sub_factor].score_rating = scoreRating;

                            if (typeof stats[subFactor.factor] == 'undefined') {
                                stats[subFactor.factor] = 0;
                            }

                            stats[subFactor.factor] += companySubFactors[subFactor.sub_factor].weighted_score;
                        }
                    }
                    companySubFactors.r_score = Math.floor(rScore);
                    companySubFactors.stats = stats;
                    companies.push(companySubFactors);
                }

                companies.sort(function (a, b) {
                    return parseFloat(a.r_score) - parseFloat(b.r_score);
                });

                var limit = requestParams.limit || ((companies.length > 5) ? 5 : companies.length);
                companies = (companies.length > 1) ? companies.slice(0, limit - 1) : companies;
                console.log(companies);
                return jsendRepsonse.sendSuccess(companies, res);
            });
        });
    }
};