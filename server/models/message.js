var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
    

// create a schema for massage
var MessageSchema = new Schema({
  created: Date,
  content: String,
  username: String,
  room: String
});

// create a model from the message schema
var Message = mongoose.model('Message', MessageSchema);

//we will add schema for groups later on


module.exports = Message;