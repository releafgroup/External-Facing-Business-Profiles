const jsendResponse = require('../helpers/jsend_response');
const WatchedCompany = require('../models/watched_company');
const Company = require('../models/company');
const Investor = require('../models').Investor;
const config = require('../config/config');
const addWatchlistValidation = require('../validations/add_watchlist_validation');
const mongoose = require('mongoose');

module.exports = {
    add: (req, res) => {
        let requestParams = req.body;
        let investorId = req.params.investorId;
        Investor.findOne({where: {id: investorId}, raw: true, attributes: ['id']}).then((investor) => {
            if (!investor) {
                return jsendResponse.sendError("Investor not found", 404, res);
            }
            addWatchlistValidation(requestParams, (err) => {
                if (err) {
                    return jsendResponse.sendError(err, 400, res);
                }

                let companyId = requestParams.company_id;

                // Ensure investor hasn't already added company to watchlist
                WatchedCompany.find({'investor_id': investorId, 'company_id': companyId}).then((watchedCompanies) => {
                    if (watchedCompanies.length > 0) {
                        return jsendResponse.sendError("Company already added to watchlist", 400, res);
                    }
                    Company.findById(companyId).then((company) => {
                        if (!company) {
                            return jsendResponse.sendError("Company not found", 404, res);
                        }
                        let watchlist = new WatchedCompany({
                            'investor_id': investorId,
                            'company_id': mongoose.Types.ObjectId(requestParams.company_id)
                        });
                        watchlist.save().then(() => {
                            return jsendResponse.sendSuccess(true, res);
                        }).catch((err) => {
                            return jsendResponse.sendError(err.message, 400, res);
                        });
                    }).catch((err) => {
                        return jsendResponse.sendError(err.message, 500, res);
                    });
                }).catch((err) => {
                    return jsendResponse.sendError(err.message, 500, res);
                });

            });
        }).catch((err) => {
            return jsendResponse.sendError(err.message, 500, res);
        });
    },
    remove: (req, res) => {
        let id = req.params.id;
        WatchedCompany.findByIdAndRemove(id).then((status) => {
            if (!status) {
                return jsendResponse.sendError("Watched company does not exists", 404, res);
            }
            return jsendResponse.sendSuccess(true, res);
        }).catch((err) => {
            return jsendResponse.sendError(err.message, 500, res);
        });
    },
    getAll: (req, res) => {
        let size = req.query.size || config.QUERY_LIMIT;
        let page = req.query.page || 1;

        let investorId = req.params.investorId;

        WatchedCompany.count({'investor_id': investorId}, function (err, total) {
            WatchedCompany.find({'investor_id': investorId}).limit(parseInt(size)).skip((page - 1) * size).then((watchedCompanies) => {
                return jsendResponse.sendSuccess({
                    result: watchedCompanies,
                    total: total,
                    page: page,
                    size: size,
                }, res);
            }).catch((err) => {
                return jsendResponse.sendError(err.message, 500, res);
            });
        });
    }
};