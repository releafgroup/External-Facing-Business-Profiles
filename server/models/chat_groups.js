var mongoose = require('mongoose'),
        Schema = mongoose.Schema;


// create a schema for groups
var GroupsSchema = new Schema({
  name: {type: String, required: true, unique: true}, //for private chat name would be senderUsername_receiverUsername
  owner: {type: String}, //email of the creater
  members: {type: [mongoose.Schema.Types.ObjectId], "default": []}, //add remove members //username//actually id
  status: {type: Boolean, default: true}, //either its active or deleted,
  type: {type: String, default: "group", enum: ['group', 'private']} //private(direct-user to user)//group
}, {
  timestamps: true
});

// create a model from the groups schema
var ChatGroups = mongoose.model('ChatGroups', GroupsSchema);


module.exports = ChatGroups;