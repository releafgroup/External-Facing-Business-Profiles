var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    bcrypt = require('bcrypt'); 

// Create custom validators
rating_1_validation = {validator: function(r) { return r >= 1 && r <= 5; }, message: "Rating 1 is not between 1 and 5"};
rating_2_validation = {validator: function(r) { return r >= 1 && r <= 5; }, message: "Rating 2 is not between 1 and 5"};
rating_3_validation = {validator: function(r) { return r >= 1 && r <= 5; }, message: "Rating 3 is not between 1 and 5"};

gender_validation = {validator: function(r) { return r == "Male" || r == "Female"; }, message: "Gender must be Male or Female" }; // TODO: make all lowercase or uppercase

var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; // regex outside for better performance
email_validation = {validator: function(email) { return re.test(email); }, message: "Invalid email format"};

// Create Volunteer Schema
// _id serves as username
var UserSchema = new Schema({
    password : {type : String, select : false},
    first_name : {type : String, required : true},
    last_name : {type : String, required : true},
    email : { type  : String, required : true, validate: email_validation},
    primary_institution : { type : String},
    secondary_institution : { type : String},
    skill_1 : { type : String},
    skill_2 : { type : String},
    skill_3 : { type : String},
    skill_1_rating : { type : Number, validate: rating_1_validation},
    skill_2_rating : { type : Number, validate: rating_2_validation},
    skill_3_rating : { type : Number, validate: rating_3_validation},
    gender: {type: String, validate: gender_validation},
    dob: {type: Date}
}, {
    timestamps: true
}); 

UserSchema.index({email: 1}, {unique: true}); // TODO: figure out why this doesn't work

UserSchema.methods.comparePassword = function(password){ 
    var user = this;
    return bcrypt.compareSync(password, user.password);
};

module.exports = mongoose.model('User', UserSchema);
