var express = require('express');

module.exports = function (io) {

  //var mongoose = require('mongoose'); //get collection mongoose.connections[0].collections;
  var debug = require('debug')('server:io');
  var router = express.Router();
  var Message = require('../models/message.js');
  //var authFunc = require('../utils/authfunc.js');
  var Groups = require('../models/chat_groups.js');
  //var db = mongoose.connection;
  //console.log("Collections:", db.collection('messages'), db.messages);
//This route produces a list of message as filterd by 'room' query
  router
          .get('/messages/:room', function (req, res) {
            debug(' got messages request ', req.params)
            //Find
            Message.find({
              'room': req.params.room.toLowerCase()
            }).exec(function (err, msgs) {
              //Send
              debug('Found saved messages for room ' + req.query.room.toLowerCase(), " Count" + msgs.length)
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
          //will filter later on
          .get(function (req, res) {
            debug(' got groups request ', req.query)

//            Find
            Groups.find({
              status: true
            }).exec(function (err, groups) {
              //Send
              debug('Found saved groups  Count' + groups.length)
              res.json(groups);
            });
          })
          //add new group//with members//
          .post(function (req, res) {
            debug('groups post request ', req.body)
            Groups.findOne({
              'name': req.body.name
            }).exec(function (err, group) {
              if (err) {
                return res.json({success: false, message: handleGroupSaveError(err)});
              }
              if (group) {
                //send error that this group name is taken already
                return res.json({success: false, message: handleGroupSaveError({code: 11000})});
              }


              var members = JSON.parse(req.body.members);

              var owner = '';//req.session.passport.user;//for now we keep it blank//this should be req.session.passport.user
              
              var groupData = {
                name: req.body.name, //uniq
                owner: owner,
                members: members
              };
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
          .route('/groups/:name/member/:id/')//id===username/email
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
            // TODO: delete associated projects
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
  // Function for company error handling in saving company info
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

  /*|||||||||||||||| SOCKET CONNECTION for messenger |||||||||||||||||||||||*/
//Listen for connection socket 
  io.on('connection', function (socket) {

    debug('new connection');
    var defaultRoom = 'general';
    //var rooms = ["General", "private"];

    //Emit the rooms array
//    socket.emit('rooms', {
//      rooms: rooms //will implement rooms from database later on//actually saved groups
//    });

    //Listens for new user
    socket.on('new user', function (data) {
      debug('on new user event ', data);
      data.room = defaultRoom;
      //New user joins the default room
      socket.join(defaultRoom);
      //Tell all those in the room that a new user joined
      io.in(defaultRoom).emit('user joined', data);
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
    socket.on('message', function (data) {
      debug('on message event with ', data);
      //Create message
      var newMsg = new Message({
        username: data.username,
        content: data.message,
        room: data.room.toLowerCase(),
        created: new Date()
      });
      //Save it to database
      newMsg.save(function (err, msg) {
        if (err) {
          debug('Error saving message', err);
          return;
        }
        //implementation of private person to person message later on
        //if(msg.private && meg.to){
        //  //code goes here to send message to that user's socket only
        //  //if the targeted user not online we will send an email later on with the gross messages
        //}

        //Send message to those connected in the room
        debug('Saved  message', msg.room);
        io.in(msg.room).emit('message', msg);
      });
    });
    socket.on('disconnect', function () {
      debug("disconnected client"); //If Verbose Debug
    });
  });
  //end of socket server implementation

  return router;
}



