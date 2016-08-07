var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    bcrypt = require('bcrypt'); 
var express = require('express');
var app = express();

// Validation error messages
var generic_error = "There was an error saving the volunteer"
var val_messages = {
    'rating_1': {'mocha_db': "Rating 1 is not between 1 and 5", 'development': generic_error, 'production': generic_error},
    'rating_2': {'mocha_db': "Rating 2 is not between 1 and 5", 'development': generic_error, 'production': generic_error},
    'rating_3': {'mocha_db': "Rating 3 is not between 1 and 5", 'development': generic_error, 'production': generic_error},
    'gender': {'mocha_db': "Gender must be Male or Female", 'development': generic_error, 'production': generic_error},
    'email': {'mocha_db': "Invalid email format", 'development': generic_error, 'production': generic_error},
    'skill_1': {'mocha_db': "Skill 1 must be different than skills 2 and 3", 'development': generic_error, 'production': generic_error},
    'skill_2': {'mocha_db': "Skill 2 must be different than skills 1 and 3", 'development': generic_error, 'production': generic_error},
    'skill_3': {'mocha_db': "Skill 3 must be different than skills 1 and 2", 'development': generic_error, 'production': generic_error},
    'dob': {'mocha_db': "Date must be in the past", 'development': generic_error, 'production': generic_error},
    'primary_institution': {'mocha_db': "Primary institution must be different than secondary", 'development': generic_error, 'production': generic_error},
    'secondary_institution': {'mocha_db': "Secondary institution must be different than primary", 'development': generic_error, 'production': generic_error},
    
}

// Create custom validators
var current_date = new Date();
current_date.setDate(current_date.getDate() - 1);
dob_validation = {validator: function(r) { return r < current_date; }, message: val_messages['dob'][app.get('env')]};

primary_institution_validation = {validator: function(r) { return r != this.secondary_institution; }, message: val_messages['primary_institution'][app.get('env')]};
secondary_institution_validation = {validator: function(r) { return r != this.primary_institution; }, message: val_messages['secondary_institution'][app.get('env')]};



skill_1_validation = {validator: function(r) { return r != this.skill_2 && r != this.skill_3; }, message: val_messages['skill_1'][app.get('env')]};
skill_2_validation = {validator: function(r) { return r != this.skill_1 && r != this.skill_3; }, message: val_messages['skill_2'][app.get('env')]};
skill_3_validation = {validator: function(r) { return r != this.skill_1 && r != this.skill_2; }, message: val_messages['skill_3'][app.get('env')]};

rating_1_validation = {validator: function(r) { return r >= 1 && r <= 5; }, message: val_messages['rating_1'][app.get('env')]};
rating_2_validation = {validator: function(r) { return r >= 1 && r <= 5; }, message: val_messages['rating_2'][app.get('env')]};
rating_3_validation = {validator: function(r) { return r >= 1 && r <= 5; }, message: val_messages['rating_3'][app.get('env')]};

gender_validation = {validator: function(r) { return r == "Male" || r == "Female"; }, message: val_messages['gender'][app.get('env')] }; // TODO: make all lowercase or uppercase

var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; // regex outside for better performance
email_validation = {validator: function(email) { return re.test(email); }, message: val_messages['email'][app.get('env')]};

// Create Volunteer Schema
// _id serves as username
var UserSchema = new Schema({
    password : {type : String, select : false, required: true},
    first_name : {type : String, required : true},
    last_name : {type : String, required : true},
    email : { type  : String, required : true, validate: email_validation},
    primary_institution : { type : String, required: true, validate: primary_institution_validation},
    secondary_institution : { type : String, required: true, validate: secondary_institution_validation},
    skill_1 : { type : String, validate: skill_1_validation, required: true},
    skill_2 : { type : String, validate: skill_2_validation, required: true},
    skill_3 : { type : String, validate: skill_3_validation, required: true},
    skill_1_rating : { type : Number, validate: rating_1_validation, required: true},
    skill_2_rating : { type : Number, validate: rating_2_validation, required: true},
    skill_3_rating : { type : Number, validate: rating_3_validation, required: true},
    gender: {type: String, validate: gender_validation, required: true},
    dob: {type: Date, required: true, validate: dob_validation}
}); 

UserSchema.index({email: 1}, {unique: true}); // TODO: figure out why this doesn't work

UserSchema.methods.comparePassword = function(password){ 
    var user = this;
    return bcrypt.compareSync(password, user.password);
};

module.exports = mongoose.model('User', UserSchema);
