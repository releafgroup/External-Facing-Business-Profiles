const jsendResponse = require('../helpers/jsend_response');
const SubFactor = require('../models/sub_factor');
const FactorQuery = require('../models/factor_query');
const nodeMailer = require('../libs/node_mailer');

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
        FactorQuery.findOne({_id: req.params.id}).then((query) => {
            if (!query) {
                jsendResponse.sendError("Query not found", 404, res);
            } else {
                const businessName = 'Fresh Direct';
                const investorName = 'Goke Obasa';
                const investorCompany = 'Gokizzle and Sons';
                const businessEmail = 'goke@mailinator.com';
                const html = `Hi ${businessName},<br/> My name is ${investorName} from ${investorCompany}.<br/>
                I'm interested in learning more about your business could you ${query.content} 
                Thank you , looking forward to hearing back.`;

                nodeMailer.send('Hello There from Releaf', html, businessEmail, [], ['releaffounders@mit.edu'], 'data@releaf.ng');
                jsendResponse.sendSuccess(true, res);
            }
        }).catch((error) => {
            jsendResponse.sendError(error.message, 500, res);
        });
    }
};