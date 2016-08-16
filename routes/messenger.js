var express = require('express');

module.exports = function (io) {

  var debug = require('debug')('server:io');
  var router = express.Router();
  var Message = require('../models/message.js');
  var authFunc = require('../utils/authfunc.js');


//This route produces a list of message as filterd by 'room' query
  router
        .get('/messages', function (req, res) {
          debug(' got messages request ', req.query)
          //Find
          Message.find({
            'room': req.query.room.toLowerCase()
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
