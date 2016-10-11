module.exports = function (io) {
    var username = '';
    var config = require('./../config');
    var dl = require('delivery');
    var debug = require('debug')('server:io');
    var Message = require('./../models/message');
    var helper = require('./../helpers/messenger');
    var nodemailer = require('./../utils/node_mailer');
    require('./../utils/messenger_mail_scheduler')();
    var usersOnline = [];
    var userSockets = {};

    nodemailer.setupTransport(config.mailConfig.smtp);
    console.log('-Messenger Socket Server running...');

    /**
     * SOCKET CONNECTION for messenger
     */
    // Listen for connection socket
    io.on('connection', function (socket) {
        debug('new connection ', socket.handshake.headers.cookie);
        if (!socket.handshake.headers.cookie)return socket.disconnect();
        var defaultRoom = 'general';
        var delivery = dl.listen(socket);
        delivery.on('receive.success', function (file) {
            var data = file.params;
            if (!validateRequest(data)) {
                return socket.emit('error', {success: false, message: 'Missing data on request!'});
            }
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

        function validateRequest(data) {
            if (!data.username || !username)
                return false;
            return true;
        }

        function sendPrivateMessage(msg) {
            if (msg.type == 'private') {
                if (!helper.isOnline(msg.to)) {
                    if (helper.msgQ.indexOf(msg.to) == -1)
                        helper.msgQ.push(msg.to);
                }
                //userSockets[msg.to] is the saved socket for the specific user
                if (userSockets[msg.to]) {
                    userSockets[msg.to].emit('send:message', msg);
                }
            }
        }

        //Listens for new user
        socket.on('user:new', function (data) {
            debug('on new user event ', data);
            if (usersOnline.indexOf(data.username) == -1) {
                usersOnline.push(data.username);
                if (helper.msgQ.indexOf(data.username) !== -1)
                    helper.msgQ.splice(helper.msgQ.indexOf(data.username), 1);
            }

            username = data.username;

            userSockets[username] = socket;
            socket.join(defaultRoom);
            if (!data.room)
                data.room = defaultRoom;


            //New user joins the default room
            socket.join(data.room);

            helper.getGroups({
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
            helper.fetchMessages(option, function (err, msgs) {
                socket.emit('fetch:message', {messages: msgs, option: option});
            });
        });


        // Listens for switch room
        socket.on('join:room', function (data) {
            //Handles joining and leaving rooms
            debug("On switch room ", data);
            socket.join(data.room);
        });
        //Listens for a new chat message
        socket.on('send:message', function (data) {

            //Create message
            if (!data.username)
                return socket.emit('error', {success: false, message: 'not logged in'});
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
            debug("disconnected client ", username);
            usersOnline.splice(usersOnline.indexOf(username), 1);
            socket.broadcast.emit('user:offline', {
                username: username
            });
        });

        //admin
        socket.on('admin:new:group', function (data) {
            debug('data:', data);
            helper.createNewGroup({data: data}, function (result) {
                socket.emit('admin:new:group', result);
                if (result.success)
                    io.emit('groupManager:new:group', result);
            });
        });

        socket.on('admin:update:group', function (data) {
            debug('data:', data);
            helper.updateGroup(data, function (result) {
                socket.emit('admin:update:group', result);
                if (result.success)
                    io.emit('groupManager:update:group', result);
            });
        });

    });
    return io;
};