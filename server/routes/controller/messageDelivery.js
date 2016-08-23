var moment = require('moment');

var config = require('../../config');
var nodemailer = require('./nodeMailer.js');
nodemailer.setupTransport(config.mailConfig);
console.log(config);
// var mailOptions = {
//        from: 'Mustak <ahmedrajukcl03@gmail.com', // sender address
//        to: 'mahmed0715@gmail.com', // list of receivers
//        subject: 'test subject', // Subject line
//        html: '<b>Hello this is test </b>' // html body
//    };
//    nodemailer.sendMail(mailOptions);

module.exports = function () {
  var messenger = require('../messenger.js');
  var schedule = require('node-schedule');
  var cronString = '0 */4 * * *';

function formatTime(dateStr){
  return moment(dateStr).format('LT');
}
function formatMessage(msg){
  return "<br>At: "+formatTime(msg.createdAt) + " <br> "+ msg.content+" <br>"+msg.createdAt+"<br>";
}

  //will get the array of the queue and get all messages for each users to send and get the email of the user
  //then send emails

getEmailByUser(function(err, msgs){
  //will get all messages for last 4 hours
  //now will filter by user and send emails 
  var filteredMsg = filterByUser(msgs);//filteredMsg[idTo]//somehow we need to get the emails of the id users
  for(var msg in filteredMsg){
    (function(msg){
      var mailOptions = {
        from: 'Mustak <tester0715@gmail.com', // sender address
        to: 'mahmed0715@gmail.com', // list of receivers
        subject: "Unread message from "+msg.msg.username, // Subject line
        html: msg.html // html body
    };
    nodemailer.sendMail(mailOptions);
    })(msg);
  } 
  
  
},{
  //option here
});
function filterByUser(msgs){
  var d = {};
  
  for(var msg in msgs){
  
    if(!d[msg.to]){
      d[msg.to] = {};
      d[msg.to].msg = [];
      d[msg.to].html = '';
    }
    d[msg.to].html += formatMessage();
    d[msg.to].msg.push(msg);
  }
  return d;
}

  
  var j = schedule.scheduleJob(cronString, function (y) {
    console.log('The answer to life, the universe, and everything!', new Date());
  })
  return j;
}
//setInterval(function(y){
//  console.log('The answer to life, the universe, and everything!',y);
//}, 1000);
//var k = schedule.scheduleJob('* /1 * * * *', function(y){
////  var j = schedule.scheduleJob(rule, function () {
//    console.log('The answer to life, the universe, and everything!',y);
//  })