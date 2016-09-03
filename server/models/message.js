var mongoose = require('mongoose'),
        Schema = mongoose.Schema;


// create a schema for massage
var MessageSchema = new Schema({
  username: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
  room: {type: String, required: true},
  content: {type: String},
  type: {type: String, default: "group", enum: ['group', 'private']},
  to: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},//private(direct-user to user)//group,
  file :{data:Buffer, contentType:String, name:String}// could be BSON to store 16mb data to db directlly //need to investigate
}, {
  timestamps: true
});

// create a model from the message schema
var Message = mongoose.model('Message', MessageSchema);

//we will add schema for groups later on


module.exports = Message;