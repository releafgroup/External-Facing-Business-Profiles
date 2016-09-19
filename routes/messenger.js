
module.exports = function (io) {
    var username = '';
    var moment = require('moment');

    var config = require('./../config');


    var schedule = require('node-schedule');

    var express = require('express');
    var path = require('path');
    var fs = require('fs');
    var dl = require('delivery');
    var spanHours = .5;//
    var cronString = '59 * * * *';//4 hours// * */4 * * *
    var usersOnline = [];
    var msgQ = [];
    var userSockets = {};
    var debug = require('debug')('server:io');
    var router = express.Router();
    var Message = require('./../models/message.js');
    var Groups = require('./../models/chat_groups.js');

    var user_functions = require('../utils/user_functions');
    var nodemailer = require('./nodeMailer');
    nodemailer.setupTransport(config.mailConfig.smtp);

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


    /** Route: /volunteers
     * GET
     * No input
     * Returns list of all volunteers
     * If success: {success: true, message: [volunteers]}
     * If failure: {success: false, ...}
     * See getAllUsers for more info
     */
    router.route('/volunteers')
        .get(function(req, res){

            return user_functions.getAllUsers(req, res);

        });


//OK:100% //need to protect it by auth
//
// @id is the message _id
//this will send the file to download on request
    router.route('/messages/file/:id')
        .get(function (req, res) {
            debug(' got file download request ', req.params)
            //Find
            Message.findOne({
                '_id': req.params.id
            }).exec(function (err, msg) {
                if (err) {
                    return res.status(500).end('No file found!');
                }
                if (!msg || !msg.file || !msg.file.data) {
                    return res.status(404).end('No file found!');
                }
                //Send
                debug('Found saved message by id', msg.file)
                res.writeHead(200, {'Content-Type': 'application/force-download', 'Content-disposition': 'attachment; filename=' + msg.file.name});
                res.end(msg.file.data);
            });
        });
    //file sharing done
    router.route('/groups')
    //gets all saved active groups
    //will filter later on
    //FILTER THERE IN INNER FUNC
        .get(function (req, res) {
            debug(' got groups request ', req.query)
            getGroups(function (err, groups) {
                if (err)
                    return res.json({success: false, message: err.message});
                res.json({success: true, groups: groups});
            });
//
        })
    ;

    router.route('/admin/groups')
    //gets all saved active groups
    //will filter later on
    //FILTER THERE IN INNER FUNC
        .get(function (req, res) {
            debug(' got groups request ', req.query)
            getGroups({admin: true}, function (err, groups) {
                if (err)
                    return res.json({success: false, message: err.message});
                res.json({success: true, groups: groups});
            });
//
        })
        //add new group//with members//
        .post(function (req, res) {
            debug('Data:', req.body);
            //return res.json(req.body)
            var user = req.session.passport.user;//"57b6fda08edf43040d2c9574";

            debug('groups post request ', user)
            var members = JSON.parse(req.body.members);
            debug('members ', members)

            var query = req.body.id;

            //debug('query ', query)
            Groups.find({
                '_id': query
            }).exec(function (err, group) {
                if (err) {
                    return res.json({success: false, message: handleGroupSaveError(err)});
                }
                if (group) {
                    //send error that this group , is taken already
                    return res.json({success: false, message: handleGroupSaveError({code: 11000})});
                }
                debug(' not found ')



                var owner = user; //for now we keep it blank//this should be req.session.passport.user
                var groupData = {
                    name: req.body.name, //uniq
                    owner: owner,
                    members: members,
                    photo: req.body.photo
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




///==================================== general functtions====================================//

    var updateGroup = function (option, cb) {
        Groups.findOne({_id: option._id}).exec(function (err, doc) {
            if (err) {
                return cb({success: false, message: err.message});
            }
            if (!doc) {
                return cb({success: false, message: "Group not found!"});
            }
            for (var a in option.data) {
                doc[a] = option.data[a];
            }
            doc.save(function (err, affected) {
                if (err)
                    return cb({success: false, message: err.message});
                Groups.findOne({_id: option._id}).populate('members').exec(function (err, group2) {
                    return cb({_id: option._id, group: group2, success: true}); // Returns company id
                });
            });
        });
    }
    var createNewGroup = function (option, cb) {
        //debug('query ', query)
        Groups.findOne({
            'name': option.data.name
        }).exec(function (err, group) {
            if (err) {
                return cb({success: false, message: handleGroupSaveError(err)});
            }
            if (group) {
                //send error that this group name is taken already
                return cb({success: false, message: handleGroupSaveError({code: 11000})});
            }
            debug(' not found ')



            var owner = username; //for now we keep it blank//this should be req.session.passport.user
            var groupData = {
                name: option.data.name, //uniq
                owner: owner,
                members: option.data.members
            };
            if (option.data.photo && option.data.photo.length > 100) {
                groupData.photo = option.data.photo;
            }

            // Populate Information to group instance
            var group = new Groups(groupData);
            group.save(function (err, group) {
                if (err) {
                    return cb({success: false, message: handleGroupSaveError(err)});
                }
                Groups.findOne({_id: group._id}).populate('members').exec(function (err, group2) {
                    return cb({_id: group._id, group: group2, success: true}); // Returns company id
                });

            });
        })
    }
    function fetchMessages(option, cb) {
        var query = {};

        if (option.type == 'private') {
            query.room = {$in: [option.room, '@' + option.username]};
        } else {
            query.room = option.room;
        }

        var skip = 0;
        if (option.skip) {
            skip = option.skip;
        }

        var limit = 1000;
        if (option.limit) {
            limit = option.limit;
        }

        Message.find(query,
            {'file.data': 0}, //we skip the file data for faster messages loading
            {
                skip: skip * limit, // Starting Row
                limit: limit, // Ending Row
                sort: {
                    createdAt: 1 //Sort by Date Added DESC
                }
            }).exec(cb);
    }
    function getGroups(option, cb) {
//     Find
        var query = {};
        if (typeof option == 'function') {
            cb = option;
        } else {
//      option.username = "57b6fda08edf43040d2c9574";
            if (option.username) {
                query.members = option.username;
            }
        }
        if (!option.admin) {
            query.status = true;
        }
        //to get only that users saved groups
        debug('Query in getGroups:', query);
        Groups.
        find(query).populate('members').exec(cb);
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
            type: 'private',
//      from: options.from,
//      to: options.to,
            createdAt: {$gt: new Date() - (spanHours * 60 * 60 * 1000) - 10 * 1000}//-10 second rewind

        }, null, {
            skip: 0, // Starting Row
            limit: 2,
            sort: {
                createdAt: 1 //Sort by Date Added DESC
            }
        }).exec(function (err, msgs) {
            //Send
            debug('Found saved messages for user ' + options.to + ' Count ' + msgs.length)
            cb(err, msgs);
        });
    }
    ///
    function formatTime(dateStr) {
        return moment(dateStr).format('LT');
    }
    function formatMessage(msg) {
        return "<br>At: " + formatTime(msg.createdAt) + " <br> " + msg.content + " <br><br>";
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
    var j = schedule.scheduleJob(cronString, function (y) {
        debug.log('The answer to life, the universe, and everything!', new Date());

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
    })

    j.cancel();



    /*|||||||||||||||| SOCKET CONNECTION for messenger |||||||||||||||||||||||*/
//Listen for connection socket

    io.on('connection', function (socket) {

        debug('new connection ', socket.handshake.headers.cookie); //socket.request
        if(!socket.handshake.headers.cookie)return socket.disconnect();
        var defaultRoom = 'general';
        var delivery = dl.listen(socket);
        delivery.on('receive.success', function (file) {
            var data = file.params;
            if (!validateReuest(data)) {
                return socket.emit('error', {success: false, message: 'Missing data on request!'});
            }
            ;
            var msgNew = {
                username: data.username,
                content: data.content,
                room: data.room,
                file: {
                    name: file.name,
                    data: file.buffer,
                    contentType: data.file.contentType
                }
            };
            if (data.type) {
                msgNew.type = data.type;
            }
            if (data.to) {
                msgNew.to = data.to;
            }
            debug('on message event with ', msgNew);
            var newMsg = new Message(msgNew);
            //Save it to database
            newMsg.save(function (err, msg) {
                if (err) {
                    debug('Error saving message', err);
                    return socket.emit('error', {success: false, message: err.message});
                    // return ;
                }
                debug('File saved in DB:', msg);
                debug('sending message', msg.room);
                //send to all
                io.in(msg.room).emit('send:message', msg);
                //sending private message
                sendPrivateMessage(msg);
            });
        });
        delivery.on('receive.progress', function (file) {
            debug('in progress', file.name)
        });

        var validateReuest = function (data) {
            if (!data.username || !username)
                return false;
            return true;
        }
        function sendPrivateMessage(msg) {
            if (msg.type == 'private') {
//        debug('private-msg.to', msg.to);
                if (!isOnline(msg.to)) {
//          debug('isOnline', isOnline);
                    if (msgQ.indexOf(msg.to) == -1)
                        msgQ.push(msg.to);
                }
                //userSockets[msg.to] is the saved socket for the specific user
//        console.log();
                if (userSockets[msg.to]) {
                    userSockets[msg.to].emit('send:message', msg);
                }
//        debug('userSockets:', userSockets);
            }
        }


        //Listens for new user
        socket.on('user:new', function (data) {
            debug('on new user event ', data);
            if (usersOnline.indexOf(data.username) == -1) {
                usersOnline.push(data.username);
                if (msgQ.indexOf(data.username) !== -1)
                    msgQ.splice(msgQ.indexOf(data.username), 1);
            }

            username = data.username;

            //userSockets.mustak = sockID
            userSockets[username] = socket;
            socket.join(defaultRoom);
            if (!data.romm)
                data.room = defaultRoom;


            //New user joins the default room
            socket.join(data.room);

            getGroups({
                username: username
            }, function (err, groups) {
                socket.emit('init', {username: username, room: data.room, usersOnline: usersOnline, groups: groups});
                //Tell all those in the room that a new user joined
                io.emit('user:online', data);
            });
        });

        //// listen for fetchMessage request for a room///
        //--params
        //@room : the room name
        //@skip : the page number
        socket.on('fetch:message', function (option) {
            fetchMessages(option, function (err, msgs) {
                socket.emit('fetch:message', {messages: msgs, option: option});
            });
        });



//Listens for switch room
        socket.on('join:room', function (data) {
            //Handles joining and leaving rooms
            debug("On switch room ", data);
//      socket.leave(data.room);
            socket.join(data.room);
        });
        //Listens for a new chat message
        socket.on('send:message', function (data) {

            //Create message
            if (!data.username)
                return socket.emit('error', {success: false, message: 'not logged in'});
            ;
            var msgNew = {
                username: data.username,
                content: data.content,
                room: data.room
            };
            if (data.type) {
                msgNew.type = data.type;
            }
            if (data.to) {
                msgNew.to = data.to;
            }
            if (data.createdAt) {
                msgNew.createdAt = data.createdAt;
            }
            debug('on message event with ', msgNew);
            var newMsg = new Message(msgNew);
            //Save it to database
            newMsg.save(function (err, msg) {
                if (err) {
                    debug('Error saving message', err);
                    return socket.emit('error', {success: false, message: err.message});
                    // return ;
                }

                //Send message to those connected in the room
                //we will not send data for now
                //if user needs it there will be downloads available
                msg.file.data = [];
                debug('sending message', msg.room);
                io.in(msg.room).emit('send:message', msg);
                if (msg.type == 'private') {
                    socket.emit('send:message', msg);
                    sendPrivateMessage(msg);
                }
            });
        });
        socket.on('disconnect', function () {
            debug("disconnected client ", username); //If Verbose Debug
            //setTimeout(function () {
            usersOnline.splice(usersOnline.indexOf(username), 1);
            socket.broadcast.emit('user:offline', {
                username: username
            });
            //  }, 0);
        });


        //admin
        socket.on('admin:new:group', function (data) {
            debug('data:', data);
            createNewGroup({data: data}, function (result) {
                socket.emit('admin:new:group', result);
                if (result.success)
                    io.emit('groupManager:new:group', result);
            });
        });

        socket.on('admin:update:group', function (data) {
            debug('data:', data);
            updateGroup(data, function (result) {
                socket.emit('admin:update:group', result);
                if (result.success)
                    io.emit('groupManager:update:group', result);
            });
        });

    });
    //end of socket server implementation

    return router;
}