module.exports = function (io) {
  var debug = require('debug')('server:mailer');
  var config = require('./../config');
  var schedule = require('node-schedule');
  var spanHours = config.mailConfig.spanHours;//
  var cronString = '* */'+spanHours+' * * *';//4 hours// * */4 * * *
  var nodemailer = require('./../utils/node_mailer');
  nodemailer.setupTransport(config.mailConfig.smtp);
  var helper = require('./../helpers/messenger');
   debug("-Running scheduler... ");
  // here will run cron job acording to the string top
  var job = schedule.scheduleJob(cronString, function (y) {
    debug("-Running scheduler function... msgQ: ", helper.msgQ);
    helper.getQueuedPrivateMsg(function (err, msgs) {
      //will get all messages for last 4 hours
      //now will filter by user and send emails
      var filteredMsg = helper.filterByUser(msgs);//filteredMsg[idTo]//somehow we need to get the emails of the id users
      debug(" -- Msgs filtered in scheduler- ", filteredMsg);
      for (var i in filteredMsg) {
        (function (msg) {
         debug(" -- Msg inner- ", msg);
         debug("-to--", msg.messages[0].to[msg.messages[0].to["signupType"]].email);
          var mailOptions = {
            from: config.mailConfig.sendingEmailFrom.name +" <"+ config.mailConfig.sendingEmailFrom.email +">", // sender address
            to: msg.messages[0].to[msg.messages[0].to["signupType"]].email, // list of receivers
            subject: "Unread message from " + msg.messages[0].username[msg.messages[0].username["signupType"]].last_name, // Subject line
            html: msg.html // html body
          };
          nodemailer.sendMail(mailOptions);
        })(filteredMsg[i]);
      }
       setTimeout(function(){helper.msgQ = [];}, 10);

    }, {
      //option here
      to: helper.msgQ
    });
  });
}