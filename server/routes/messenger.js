
module.exports = function (io) {
  var moment = require('moment');

  var config = require('./../config');
  

  var schedule = require('node-schedule');
  
  var express = require('express');
  
  var spanHours = 34;
  var cronString = '39 * * * *';//4 hours// * */4 * * *
  var usersOnline = [];
  var msgQ = [];
  var userSockets = {};
//var mongoose = require('mongoose'); //get collection mongoose.connections[0].collections;
  var debug = require('debug')('server:io');
  var router = express.Router();
  var Message = require('./../models/message.js');
  //var authFunc = require('../utils/authfunc.js');
  var Groups = require('./../models/chat_groups.js');
  
  var nodemailer = require('./controller/nodeMailer.js');
  nodemailer.setupTransport(config.mailConfig.smtp);
  //var db = mongoose.connection;
  //console.log("Collections:", db.collection('messages'), db.messages);
//This route produces a list of message as filterd by 'room' query
//57b71e36d3a81910262fd7c5
//57b9d53b3163c5dc321f2435
  router
          .get('/messages/:room', function (req, res) {
            debug(' got messages request ', req.params)
            //Find
            Message.find({
              'room': req.params.room.toLowerCase()
            }, null, {
              skip: 0, // Starting Row
              limit: 100, // Ending Row
              sort: {
                createdAt: -1 //Sort by Date Added DESC
              }
            }).exec(function (err, msgs) {
              //Send
              debug('Found saved messages for room ' + req.params.room.toLowerCase(), " Count" + msgs.length)
              res.json(msgs);
            });
          })

          //Listens for a new chat message
//          .post('/new', function (req, res) {
//            //Create message
//            var data = req.body;
//            var newMsg = new Message({
//              username: data.username,
//              content: data.message,
//              room: data.room.toLowerCase(),
//              created: new Date()
//            });
//            //Save it to database
//            newMsg.save(function (err, msg) {
//              //Send message to those connected in the room
//              res.json(msg);
//            });
//          });
          ;
  router.route('/groups')
          //gets all saved active groups
          //will filter later on//{$where : 'this.members.indexOf("USERID") != -1'}
          .get(function (req, res) {
            debug(' got groups request ', req.query)
            getGroups(function (err, groups) {
              if (err)
                return res.json({success: false, message: err.message});
              res.json({success: true, groups: groups});
            });
//           
          })
          //add new group//with members//
          .post(function (req, res) {
            var user = "57b6fda08edf43040d2c9574"; //req.session.passport.user;

            debug('groups post request ', user)
            var members = JSON.parse(req.body.members);
            debug('members ', members)
            if (req.body.type == 'private') {

              debug('private  ', user + "_private_" + members[0])
              var query = {"$in": [
                  user + "_private_" + members[0],
                  members[0] + "_private_" + user
                ]}
              debug(' query ', query)
              var private = true;
            } else {
              var query = req.body.name;
            }
            //debug('query ', query)
            Groups.findOne({
              'name': query
            }).exec(function (err, group) {
              if (err) {
                return res.json({success: false, message: handleGroupSaveError(err)});
              }
              if (group) {
                //send error that this group name is taken already
                return res.json({success: false, message: handleGroupSaveError({code: 11000})});
              }
              debug(' not found ')



              var owner = user; //for now we keep it blank//this should be req.session.passport.user
              members.unshift(user);
              var groupData = {
                name: req.body.name, //uniq
                owner: owner,
                members: members
              };
              if (private) {
                groupData.name = members.join('_private_');
                groupData.type = req.body.type;
              }
              // Populate Information to group instance
              var group = new Groups(groupData);
              group.save(function (err, group) {
                if (err) {
                  return res.json({success: false, message: handleGroupSaveError(err)});
                }
                return res.json({id: group.id, success: true}); // Returns company id
              });
            })
          });
  router.route('/groups/:name')
          //make inactive a group

          .put(function (req, res) {
            debug('groups put request ', req.params)
            Groups.findOne({name: req.params.name}).exec(function (err, doc) {
              if (err) {
                return res.json({success: false, message: err.message});
              }
              if (!doc) {
                return res.json({success: false, message: "Group not found!"});
              }
              doc.status = true;
              doc.save(function (err, affected) {
                if (err)
                  return res.json({success: false, message: err.message});
                res.json({success: true});
              });
            });
          }).delete(function (req, res) {
    debug('groups delete request ', req.params)
    Groups.findOne({name: req.params.name}).exec(function (err, doc) {
      if (err) {
        return res.json({success: false, message: err.message});
      }
      if (!doc) {
        return res.json({success: false, message: "Group not found!"});
      }
      doc.status = false;
      doc.save(function (err, affected) {
        if (err)
          return res.json({success: false, message: err.message});
        res.json({success: true});
      });
    });
  });
  //add remove group members any time
  router
          .route('/groups/:name/member/:id')//id===username/email
          .post(function (req, res) {

            Groups.update(
                    {name: req.params.name},
                    {$push: {'members': req.params.id}}
            , function (err, updatedRes) {
              if (err)
                return res.json({success: false, message: err.message});
              res.json({success: true, d: updatedRes});
            });
          })
          .delete(function (req, res) {
            // TODO: delete associated 
            Groups.update(
                    {name: req.params.name},
                    {$pull: {'members': req.params.id}}
            , function (err, delRes) {
              if (err)
                return res.json({success: false, message: err.message});
//              console.log()
              res.json({success: true, d: delRes});
            });
          });
  ///general functtions
  function getGroups(option, cb) {
//     Find
    var query = {status: true};
    if (typeof option == 'function') {
      cb = option;
    } else {
      option.username = "57b6fda08edf43040d2c9574";
      if (option.username) {
        query.members = option.username;
      }
    }
    Groups.find(query // "57b6fda08edf43040d2c9574",//to get only that users saved groups
            ).exec(cb);
  }
  function handleGroupSaveError(err) {
    // Check if business name already exists
    if (err.code == 11000) {
      err.message = "A Group with that name already exists";
    } else {
      // If company validation, gets one of the errors to return
      if (err.message == "Group validation failed") {
        var one_error;
        for (var first in err.errors) { // Get one of the errors
          one_error = err.errors[first];
          break;
        }
        // If it is one of the required ones i.e. Path 'XXXX' is required we change it to just XXXX is required
        if (/ is required/.test(one_error.message)) {
          one_error.message = one_error.message.replace(/^Path /gi, '');
        }
        err.message = one_error.message;
      }
    }
    return err.message;
  }
  var isOnline = function (userId) {
    return usersOnline.indexOf(userId) != -1;
  }
  //get emails by user
  var getQueuedPrivateMsg = function (cb, options) {
    Message.find({
//      'room': req.params.room.toLowerCase(),
      type: 'private',
//      from: options.from,
//      to: options.to,
      createdAt: {$gt: new Date() - (spanHours * 60 * 60 * 1000) - 10 * 1000}//-10 second rewind

    }, null, {
      skip: 0, // Starting Row
      limit:2,
      sort: {
        createdAt: 1 //Sort by Date Added DESC
      }
    }).exec(function (err, msgs) {
      //Send
      debug('Found saved messages for user ' + options.to + ' Count ' + msgs.length)
//      res.json(msgs);
      cb(err, msgs);
    });
  }
  ///
  function formatTime(dateStr) {
    return moment(dateStr).format('LT');
  }
  function formatMessage(msg) {
    return "<br>At: " + formatTime(msg.createdAt) + " <br> " + msg.content + " <br>" + msg.createdAt + "<br>";
  }
  //will get the array of the queue and get all messages for each users to send and get the email of the user
  //then send emails


  function filterByUser(msgs) {
    var d = {};

    for (var i in msgs) {
      var msg = msgs[i];
 debug("Msg", msgs[i]);
      if (!d[msg.to]) {
        d[msg.to] = {};
        d[msg.to].messages = [];
        d[msg.to].html = '';
      }
      d[msg.to].html += formatMessage(msg);
      d[msg.to].messages.push(msg);
    }
    return d;
  }


///here will run cron job acording to the string top
//  var j = schedule.scheduleJob(cronString, function (y) {
//    console.log('The answer to life, the universe, and everything!', new Date());

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
//  })



  /*|||||||||||||||| SOCKET CONNECTION for messenger |||||||||||||||||||||||*/
//Listen for connection socket 
  io.on('connection', function (socket) {

    var username = '';
    debug('new connection '); //socket.request
    var defaultRoom = 'general';
    //var rooms = ["General", "private"];

    //Emit the rooms array
//    socket.emit('rooms', {
//      rooms: rooms //will implement rooms from database later on//actually saved groups
//    });


    //Listens for new user
    socket.on('user:new', function (data) {
      debug('on new user event ', data);
      if (usersOnline.indexOf(data.username) == -1) {
        usersOnline.push(data.username);
      }

      username = data.username;
      userSockets[username] = socket;
      data.room = defaultRoom;
      //New user joins the default room
      socket.join(defaultRoom);
      getGroups({
        username: username
      }, function (err, groups) {
        socket.emit('init', {username: username, room: data.room, users: usersOnline, groups: groups});
        //Tell all those in the room that a new user joined
        io.in(defaultRoom).emit('user:joined', data);
      });
    });
//Listens for switch room
    socket.on('switch room', function (data) {
      //Handles joining and leaving rooms
      debug("On switch room ", data);
      socket.leave(data.room);
      socket.join(data.newRoom);
      io.in(data.room).emit('user left', data);
      io.in(data.newRoom).emit('user joined', data);
    });
    //Listens for a new chat message
    socket.on('send:message', function (data) {
      debug('on message event with ', data);
      //Create message
      var msgNew = {
        username: data.username,
        content: data.content,
        room: data.room.toLowerCase()
      };
      if (data.type) {
        msgNew.type = data.type;
      }
      if (data.to) {
        msgNew.to = data.to;
      }
      var newMsg = new Message(msgNew);
      //Save it to database
      newMsg.save(function (err, msg) {
        if (err) {
          debug('Error saving message', err);
          socket.emit('error', {success: false, message: err.message});
          // return ;
        }
        //implementation of private person to person message later on
        //if(msg.private && meg.to){
        //  //code goes here to send message to that user's socket only
        //  //if the targeted user not online we will send an email later on with the gross messages
        //}

        //Send message to those connected in the room
        debug('sending message', msg.room);
        io.in(msg.room).emit('send:message', msg);
        if (msg.type == 'private') {
          if (!isOnline(msg.to)) {
            if (msgQ.index(msg.to == -1))
              msgQ.push(msg.to);
          }
        }
      });
    });
    socket.on('disconnect', function () {
      debug("disconnected client ", username); //If Verbose Debug
      usersOnline.splice(usersOnline.indexOf(username), 1);
      socket.broadcast.emit('user:left', {
        username: username
      });
    });
  });
  //end of socket server implementation

  return router;
}



