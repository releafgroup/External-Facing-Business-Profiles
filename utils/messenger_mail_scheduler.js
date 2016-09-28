module.exports = function (io) {
  var config = require('./../config');
  var schedule = require('node-schedule');
  var spanHours = .5;//
  var cronString = '59 * * * *';//4 hours// * */4 * * *
  var nodemailer = require('./../utils/node_mailer');
  nodemailer.setupTransport(config.mailConfig.smtp);
  //
  //
  // here will run cron job acording to the string top
  var job = schedule.scheduleJob(cronString, function (y) {
    getQueuedPrivateMsg(function (err, msgs) {
      //will get all messages for last 4 hours
      //now will filter by user and send emails
      var filteredMsg = filterByUser(msgs);//filteredMsg[idTo]//somehow we need to get the emails of the id users
      debug("Msgs", filteredMsg);
      for (var i in filteredMsg) {
        (function (msg) {

          var mailOptions = {
            from: 'Mustak <tester0715@gmail.com', // sender address
            to: 'mahmed0715@gmail.com', // list of receivers
            subject: "Unread message from " + msg.messages[0].username, // Subject line
            html: msg.html // html body
          };
          nodemailer.sendMail(mailOptions);
        })(filteredMsg[i]);
      }


    }, {
      //option here
    });
  });
  job.cancel();
}