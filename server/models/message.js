var mongoose = require('mongoose'),
        Schema = mongoose.Schema;


// create a schema for massage
var MessageSchema = new Schema({
  username: {type: String, required: true},
  room: {type: String, required: true},
  content: {type: String}
}, {
  timestamps: true
});

// create a model from the message schema
var Message = mongoose.model('Message', MessageSchema);

//we will add schema for groups later on


module.exports = Message;