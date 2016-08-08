var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    bcrypt = require('bcrypt'); 



// Schema to handle assigning voluneers to project
// Stores references to ids of the volunteer and project
var VolunteerAssignmentSchema = new Schema({
    volunteer : {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    project : {type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true}
}, {
    timestamps: true
});


VolunteerAssignmentSchema.index({ volunteer: 1, project : 1 }, { unique: true }); // Make combo of volunteer,project unique TODO: make sure it works

module.exports = mongoose.model('VolunteerAssignment', VolunteerAssignmentSchema);

