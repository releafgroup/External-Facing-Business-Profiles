const jsendRepsonse = require('../helpers/jsend_response');
const SubFactor = require('../models/sub_factor');
const Company = require('../models/company');
const config = require('../config/config');

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
    },

    search: (req, res) => {
        var query = req.query;
        var sort = {};
        var sortKey = query.sort_by || false;
        if(sortKey){
             sort[sortKey] = -1;
        }

        var size    = query.size || config.QUERY_LIMIT;
        var page    = query.page || 1;

        var userQuery = {};
        for(var key in query){
            if(key == "size" || key == "sort_by" || key == "page"){
                continue;
            }
            if(query.hasOwnProperty(key)){
                userQuery[key] = {'$regex' : '.*' + query[key] + '.*', '$options' : 'i' };
            }
        }

        Company.count(userQuery, function(err, total) {
            Company.find(userQuery).sort(sort).limit(parseInt(size)).skip((page - 1)*size).exec(function(err, company){
                if(!company){
                    return jsendRepsonse.sendError('Error occured', 400, res);
                }

                var result = {
                    result : company,
                    total : total,
                    page : page,
                    size: size,
                };

                return jsendRepsonse.sendSuccess(result, res);

            });
        });

    },


};
