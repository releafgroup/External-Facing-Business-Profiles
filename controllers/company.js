const jsendResponse = require('../helpers/jsend_response');
const SubFactor = require('../models/sub_factor');
const Company = require('../models/company');
const config = require('../config/config');
const nodeMailer = require('../libs/node_mailer');
const CompanyInfoRequest = require('../models/company_info_request');

//validations
const requestMoreValidation = require('../validations/send_request_more_email_validation');

module.exports = {
    getAll: (req, res) => {
        let requestParams = req.query;
        let companies = [];

        // Count Only
        if (req.query.count_only) {
            Company.count().then((count) => {
                return jsendResponse.sendSuccess(count, res);
            });
        }

        let startIndex = Number(requestParams.start_index) || 0;
        SubFactor.find().then((subFactors) => {
            Company.find().then((companyInputs) => {
                for (let i = 0; i < companyInputs.length; i++) {
                    let companySubFactors = companyInputs[i].toObject();

                    let rScore = 0;
                    let stats = {};
                    for (let j = 0; j < subFactors.length; j++) {
                        let subFactor = subFactors[j];
                        let companySubFactor = companySubFactors[subFactor.sub_factor];
                        const weight = Number(requestParams[subFactor.factor]) || subFactor.weight;
                        if (companySubFactor) {
                            const scoreRating = subFactor['score_' + companySubFactor.score + '_rating'];
                            const weightedScore = companySubFactors[subFactor.sub_factor].weighted_score ?
                                companySubFactors[subFactor.sub_factor].weighted_score : 0;
                            rScore += weight * weightedScore;
                            companySubFactors[subFactor.sub_factor].score_rating = scoreRating;

                            if (typeof stats[subFactor.factor] === 'undefined') {
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

                let limit = requestParams.limit || ((companies.length > 6) ? 6 : companies.length);
                companies = (companies.length > 1) ? companies.slice(startIndex, startIndex + limit) : companies;
                return jsendResponse.sendSuccess(companies, res);
            });
        });
    },

    get: (req, res) => {
        if (!req.params.id) {
            return jsendResponse.sendError('Company not found', 404, res);
        }

        Company.findById(req.params.id, function (err, company) {
            if (!company) {
                return jsendResponse.sendError('Company not found', 404, res);
            }

            company = company.toObject();
            let companyAvailableSubFactors = 0;
            let totalSubFactors = 0;
            SubFactor.find().then((subFactors) => {
                totalSubFactors = subFactors.length;
                subFactors.forEach((subFactor) => {
                    let current_score = Number(company.hasOwnProperty(subFactor.sub_factor));
                    if (current_score !== -1) {
                        companyAvailableSubFactors += current_score;
                    }
                });
                company.profile_completion_level = parseFloat((companyAvailableSubFactors / totalSubFactors) * 100).toFixed(2);
                return jsendResponse.sendSuccess(company, res);
            });
        });
    },

    search: (req, res) => {
        let query = req.query;

        let size = Number(query.size) || config.QUERY_LIMIT;
        let page = Number(query.page) || 1;

        let userQuery = {};

        SubFactor.find().distinct('factor').then(function (factors) {

            for (let key in query) {

                if (["size", "page", "token"].indexOf(key) >= 0) {
                    continue;
                }

                if (query.hasOwnProperty(key) && factors.indexOf(key) === -1) {
                    // Other business property
                    let valueKey = query[key];

                    // Options Query
                    let optionsQuery = valueKey.split(',');
                    let rangeQuery = valueKey.split('-');
                    // Range Query
                    const minQuery = Number(rangeQuery[0]);
                    const maxQuery = Number(rangeQuery[1]);

                    if (rangeQuery.length === 2 && !(isNaN(minQuery) || isNaN(maxQuery))) {
                        userQuery[key] = {};
                        if (minQuery.length > 0) {
                            userQuery[key]['$gte'] = Number(minQuery);
                        }
                        if (maxQuery.length > 0) {
                            userQuery[key]['$lte'] = Number(maxQuery);
                        }
                    } else if (optionsQuery.length > 1) {
                        // Options Query
                        userQuery[key] = {$in: optionsQuery}
                    } else {
                        userQuery[key] = {'$regex': '.*' + query[key] + '.*', '$options': 'i'};
                    }
                } else if (factors.indexOf(key) > -1) {
                    // Filtering by range of r-factor scores

                    const minMaxQuery = query[key].split(',');

                    if (minMaxQuery.length === 2) {
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

            Company.find(userQuery).exec(function (err, companies) {
                if (!companies) {
                    return jsendResponse.sendError('Error occurred', 400, res);
                }

                // Calculate R factors
                let companiesWithRFactors = [];
                companies.forEach(function (company) {
                    company = company.toObject();
                    let rFactor = 0;
                    const weight = 1 / factors.length;
                    factors.forEach(function (factor) {
                        if (company.hasOwnProperty(factor)) {
                            rFactor += company[factor] * weight;
                        }
                    });
                    company.r_factor = Math.floor(rFactor);
                    companiesWithRFactors.push(company);
                });

                // Sorting
                companiesWithRFactors.sort(function (a, b) {
                    // Sort by alphabetical order if rfactor is the same
                    if (parseFloat(b.r_factor) === parseFloat(a.r_factor)) {
                        return b.business_name > a.business_name ? -1 : 1;
                    }
                    // Default sort by rfactor
                    return parseFloat(b.r_factor) - parseFloat(a.r_factor);
                });

                // Return actual result slice
                const startIndex = (page - 1) * size;
                const endIndex = startIndex + size;
                companiesWithRFactors = (companiesWithRFactors.length > 1) ? companiesWithRFactors.slice(startIndex, endIndex) : companiesWithRFactors;

                let result = {
                    result: companiesWithRFactors,
                    total: companies.length,
                    page: page,
                    size: size,
                };
                return jsendResponse.sendSuccess(result, res);
            });
        });

    },

    requestMore: (req, res) => {
        let requestParams = req.body;
        requestMoreValidation(requestParams, (err, value) => {
            if (err) {
                return jsendResponse.sendError(err, 400, res);
            }

            let investorEmail = requestParams['investor_email'];
            let body = requestParams['body'];
            let subject = requestParams['subject'];
            let businessEmail = requestParams['business_email'];

            let input_data = {
                'investor_email': investorEmail,
                'body': body,
                'subject': subject,
                'business_email': businessEmail
            };

            let requestSave = new CompanyInfoRequest(input_data);
            requestSave.save((err) => {
                nodeMailer.send(
                    subject,
                    body,
                    businessEmail,
                    [],
                    ['releaffounders@mit.edu'],
                    investorEmail
                );
                return jsendResponse.sendSuccess(true, res);
            });
        });

    }
};
