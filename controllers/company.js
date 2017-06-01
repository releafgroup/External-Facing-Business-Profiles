const jsendRepsonse = require('../helpers/jsend_response');
const SubFactor = require('../models/sub_factor');
const Company = require('../models/company');
const config = require('../config/config');

module.exports = {
    getAll: (req, res) => {
        var requestParams = req.query;
        var companies = [];
        var start_index = Number(requestParams.start_index) || 0;
        var limit = Number(requestParams.limit) || 6;
		var end = start_index + limit;
        var end_index = 0;
        
         SubFactor.find().then((subFactors) => {
            Company.find().then((companyInputs) => {
                for (var i = 0; i < companyInputs.length; i++) {
                    var companySubFactors = companyInputs[i].toObject();

                    let rScore = 0;
                    let stats = {};
                    for (var j = 0; j < subFactors.length; j++) {
                        var subFactor = subFactors[j];
                        var companySubFactor = companySubFactors[subFactor.sub_factor];
                        const weight = Number(requestParams[subFactor.factor]) || subFactor.weight;
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
                    return parseFloat(b.r_score) - parseFloat(a.r_score);
                });
                end_index = (end < companies.length) ? end : companies.length;
				companies = (companies.length > 1) ? companies.slice(start_index, end_index) : companies;
                return jsendRepsonse.sendSuccess(companies, res);
            });
        });,

    get: (req, res) => {
        if (!req.params.id) {
            return jsendRepsonse.sendError('Company not found', 404, res);
        }

        Company.findById(req.params.id, function (err, company) {
            if (!company) {
                return jsendRepsonse.sendError('Company not found', 404, res);
            }

            company = company.toObject();
            let companyAvailableSubFactors = 0;
            let totalSubFactors = 0;
            SubFactor.find().then((subFactors) => {
                totalSubFactors = subFactors.length;
                subFactors.forEach((subFactor) => {
                    let current_score = Number(company.hasOwnProperty(subFactor.sub_factor));
                    if (current_score != -1) {
                        companyAvailableSubFactors += current_score;
                    }
                });
                company.profile_completion_level = parseFloat((companyAvailableSubFactors / totalSubFactors) * 100).toFixed(2);
                return jsendRepsonse.sendSuccess(company, res);
            });
        });
    },

    search: (req, res) => {
        let query = req.query;
        let sort = {};
        let sortKey = query.sort_by || false;
        if (sortKey) {
            sort[sortKey] = -1;
        }

        let size = query.size || config.QUERY_LIMIT;
        let page = query.page || 1;

        let userQuery = {};

        SubFactor.find().distinct('factor').then(function (factors) {
            for (let key in query) {
                if (["size", "sort_by", "page", "token"].indexOf(key) >= 0) {
                    continue;
                }

                if (query.hasOwnProperty(key) && factors.indexOf(key) == -1) {
                    // Other business property
                    userQuery[key] = {'$regex': '.*' + query[key] + '.*', '$options': 'i'};
                } else if (factors.indexOf(key) > -1) {
                    // Filtering by range of r-factor scores
                    const minMaxQuery = query[key].split(',');
                    if (minMaxQuery.length == 2) {
                        const minQuery = minMaxQuery[0];
                        const maxQuery = minMaxQuery[1];
                        userQuery[key] = {};
                        if (minQuery.length > 0) {
                            userQuery[key]['$gte'] = Number(minQuery);
                        }
                        if (maxQuery.length > 0) {
                            userQuery[key]['$lte'] = Number(maxQuery);
                        }
                    }
                }
            }

            Company.count(userQuery, function (err, total) {
                Company.find(userQuery).sort(sort).limit(parseInt(size)).skip((page - 1) * size).exec(function (err, company) {
                    if (!company) {
                        return jsendRepsonse.sendError('Error occured', 400, res);
                    }

                    let result = {
                        result: company,
                        total: total,
                        page: page,
                        size: size,
                    };
                    return jsendRepsonse.sendSuccess(result, res);

                });
            });
        });

    },


};