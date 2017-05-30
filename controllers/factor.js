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
    factorAverage: (req, res) => {
        SubFactor.find().distinct('factor').then((factors) => {
            let factorString = "";
            let scores = {};

            /**
             * 1. Build factors string for selection
             * 2. Initialize scores object
             */
            factors.forEach((factor) => {
                const currentFactor = factor;
                factorString += factor += " ";
                scores[currentFactor] = 0;
            });
            let size = 0;
            Company.find().select(factorString).then((businessItems) => {
                businessItems.forEach((businessItem) => {
                    businessItem = businessItem.toObject();
                    /**
                     * If company has all factors
                     * Adding 1 caters for company _id property
                     */
                    if (Object.keys(businessItem).length === (factors.length + 1)) {
                        size++;
                        factors.forEach((factor) => {
                            const currentFactor = factor;
                            if (businessItem.hasOwnProperty(currentFactor)) {
                                scores[factor] += businessItem[currentFactor];
                            }
                        });
                    }
                });
                for (let key in scores) {
                    scores[key] /= size;
                    scores[key] = Math.round(scores[key]);
                }
                jsendResponse.sendSuccess(scores, res);
            });
        });


    }
};