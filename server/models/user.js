var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    bcrypt = require('bcrypt'); 

// _id serves as username
var UserSchema = new Schema({
    password : {type : String, select : false},
    first_name : {type : String, required : true},
    last_name : {type : String, required : true},
    email : { type  : String, required : true, unique: true}, // TODO: figure out why this does not work
    primary_institution : { type : String},
    secondary_institution : { type : String},
    skill_1 : { type : String},
    skill_2 : { type : String},
    skill_3 : { type : String},
    skill_1_rating : { type : Number, min: 1, max: 5},
    skill_2_rating : { type : Number, min: 1, max: 5},
    skill_3_rating : { type : Number, min: 1, max: 5},
    gender: {type: String, enum: ['Male', 'Female']},
    dob: {type: Date}
}); 

UserSchema.methods.comparePassword = function(password){ 
    var user = this;
    return bcrypt.compareSync(password, user.password);
};

module.exports = mongoose.model('User', UserSchema);
