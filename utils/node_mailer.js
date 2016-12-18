var config = require('./../config');
var sg = require('sendgrid')(config.mailConfig.sendgrid_api_key);


/**
 * Send email
 * @param templateId
 * @param subject
 * @param to
 * @param from
 * @param substitutions
 */
exports.send = function send(templateId, subject, to, from, substitutions) {
    var request = sg.emptyRequest({
        method: 'POST',
        path: '/v3/mail/send',
        body: {
            personalizations: [
                {
                    to: [{email: to}],
                    subject: subject,
                    substitutions: substitutions
                }
            ],
            from: {
                email: from
            },
            template_id: templateId

        }
    });

    sg.API(request, function (error, response) {
        if (error) {
            console.log(error.response.body);
            return false;
        }
        console.log(response);
    });
};