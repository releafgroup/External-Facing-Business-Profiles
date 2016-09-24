var io = require('socket.io-client');
var request = require('supertest');

var socketURL = 'http://localhost:3000';

var options = {
  transports: ['websocket'],
  'force new connection': true
};

var user1 = {username: 'mahmed0715'};
var user2 = {username: 'mustak'};
var user3 = {username: 'ahmed'};

describe("Messenger Socket Server", function () {


  /* Test - new user connection notification in room */
  it('Should notify new user once they connect', function (done) {
    var client = io.connect(socketURL, options);

    client.on('connect', function () {
      client.emit('new user', user1);
    });

    client.on('user joined', function (data) {
      data.room.should.equal('general');

      /* If this client doesn't disconnect it will interfere
       with the next test */
      client.disconnect();
      done();
    });
  });



  /* Test - User sends a message to chat room. */
  it('Should be able to broadcast messages', function (done) {
    var client1, client2, client3;
    var message = {username: 'user', room: 'general', message: 'Hello members'};
    var messages = 0;

    function checkMessage (client) {
      client.on('message', function (msg) {
        message.message.should.equal(msg.content);
        client.disconnect();
        messages++;
        if (messages === 3) {
          done();
        }
      });
    };

    client1 = io.connect(socketURL, options);
    checkMessage(client1);

    client1.on('connect', function () {
      client2 = io.connect(socketURL, options);
      client1.emit('new user', user1);
      checkMessage(client2);

      client2.on('connect', function () {
        client2.emit('new user', user2);
        client3 = io.connect(socketURL, options);
        checkMessage(client3);

        client3.on('connect', function () {
          client3.emit('new user', user3);
          client2.send(message);
        });
      });
    });
  });

  it('retrieves saved messsages in a room', function (done) {
    request(socketURL)
            .get('/messenger/messages?room=general')
            .send()
            .expect(200)
            .expect('Content-Type', /json/)
            .end(function (err, res) {
              if (err)
                done(err);
              res.body.should.be.instanceof(Array).and.not.be.empty;
              done();
            });
  });

//  /* Test 4 - User sends a private message to another user. */
//  it('Should be able to send private messages', function(done){
//    var client1, client2, client3;
//    var message = {to: user1.name, txt:'Private Hello World'};
//    var messages = 0;
//
//    var completeTest = function(){
//      messages.should.equal(1);
//      client1.disconnect();
//      client2.disconnect();
//      client3.disconnect();
//      done();
//    };
//
//    var checkPrivateMessage = function(client){
//      client.on('private message', function(msg){
//        message.txt.should.equal(msg.txt);
//        msg.from.should.equal(user3.name);
//        messages++;
//        if(client === client1){
//          /* The first client has received the message
//          we give some time to ensure that the others
//          will not receive the same message. */
//          setTimeout(completeTest, 40);
//        };
//      });
//    };
//
//    client1 = io.connect(socketURL, options);
//    checkPrivateMessage(client1);
//
//    client1.on('connect', function(data){
//      client1.emit('connection name', user1);
//      client2 = io.connect(socketURL, options);
//      checkPrivateMessage(client2);
//
//      client2.on('connect', function(data){
//        client2.emit('connection name', user2);
//        client3 = io.connect(socketURL, options);
//        checkPrivateMessage(client3);
//
//        client3.on('connect', function(data){
//          client3.emit('connection name', user3);
//          client3.emit('private message', message)
//        });
//      });
//    });
//  });
});
