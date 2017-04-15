const jsendResponse = require('../helpers/jsend_response');
const SubFactor = require('../models/sub_factor');
const FactorQuery = require('../models/factor_query');
const nodeMailer = require('../libs/node_mailer');
const sendFactorQueryEmailValidation = require('../validations/send_factor_query_email_validation');
const Company = require('../models/company');

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
    },
    getFactorQuery: (req, res) => {
        FactorQuery.findOne({_id: req.params.id}).then((query) => {
            if (!query) {
                jsendResponse.sendError("Query not found", 404, res);
            } else {
                jsendResponse.sendSuccess(query, res);
            }
        }).catch((error) => {
            jsendResponse.sendError(error.message, 500, res);
        });
    },
    sendQueryEmail: (req, res) => {
        sendFactorQueryEmailValidation(req.body, (err, value) => {
            if (err) {
                jsendResponse.sendError(err.message, 400, res);
            } else {
                FactorQuery.findOne({_id: req.params.id}).then((query) => {
                    if (!query) {
                        jsendResponse.sendError("Query not found", 404, res);
                    } else {
                        const businessName = req.body.business_name;
                        const investorName = req.body.investor_name;
                        const investorCompany = req.body.investor_company;
                        const businessEmail = req.body.business_email;
                        const html = `Hi ${businessName},<br/> My name is ${investorName} from ${investorCompany}.<br/>
                I'm interested in learning more about your business could you ${query.content} <br/>
                Thank you , looking forward to hearing back.`;

                        nodeMailer.send(
                            'Inquiries from Releaf',
                            html,
                            businessEmail,
                            [],
                            ['releaffounders@mit.edu'],
                            'data@releaf.ng'
                        );
                        jsendResponse.sendSuccess(true, res);
                    }
                }).catch((error) => {
                    jsendResponse.sendError(error.message, 500, res);
                });
            }
        });
    },

    rFactor: (req, res) => {

        SubFactor.find().distinct('factor').then((factors) => {
            let factorString = "";
            factors.forEach((factor) => {
                factorString += factor += " "
            });
            Company.find().select(factorString).then((businessItems) => {
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
                        } else if (!scores.hasOwnProperty(currentFactor)) {
                            scores[currentFactor] = 0;
                        }
                    });
                });

                let size = businessItems.length;

                for (var key in scores) {
                    scores[key] /= size;
                    scores[key] = Math.round(scores[key]);
                }

                jsendResponse.sendSuccess(scores, res);
            });
        });


    }
};