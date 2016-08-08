var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    bcrypt = require('bcrypt'); 



// Schema to handle assigning voluneers to companies
// Stores references to ids of the volunteer and company
var VolunteerAssignmentSchema = new Schema({
    volunteer : {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    company : {type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true}
}, {
    timestamps: true
});


VolunteerAssignmentSchema.index({ volunteer: 1, company : 1 }, { unique: true }); // Make combo of volunteer,company unique TODO: make sure it works

module.exports = mongoose.model('VolunteerAssignment', VolunteerAssignmentSchema);

