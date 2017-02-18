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
                companies = (companies.length > 1) ? companies.slice(0, limit - 1) : companies;
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
        var sort_key = query.sort_by || false;
        if(sort_key) sort[sort_key] = -1;

        var size    = query.size || config.query_limit;

        var page    = query.page || 1;

        var user_query = {};
        for(var key in query){
            if(key == "size" || key == "sort_by") continue;
            if(query.hasOwnProperty(key))
                user_query[key] = query[key];
        }

        Company.count(user_query, function(err, total) {
            Company.find(user_query).sort(sort).limit(parseInt(size)).skip((page - 1)*size).exec(function(err, company){
                if(!company){
                    return jsendRepsonse.sendError('Error occured', 400, res);
                }
                company['total'] = total;
                company['page']  = page;
                company['size']  = size;
                return jsendRepsonse.sendSuccess(company, res);
            });
        });
    }
};