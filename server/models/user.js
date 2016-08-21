var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    bcrypt = require('bcryptjs'); 
var express = require('express');
var app = express();

// Validation error messages
var generic_error = "There was an error saving the volunteer"
var val_messages = {
    'gender': {'mocha_db': "Gender must be Male or Female", 'development': generic_error, 'production': generic_error},
    'email': {'mocha_db': "Invalid email format", 'development': generic_error, 'production': generic_error},
    'skills': {'mocha_db': "Skills are required and must all be different", 'development': generic_error, 'production': generic_error},
    'skill_ratings': {'mocha_db': "Skill Ratings are required, must all be different, and must be between 1 and 5", 'development': generic_error, 'production': generic_error},    
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

function array_validation(arr, is_rating) {
    if (!arr) return false;
    if (arr.length === 0) return false;
    var counts = {};

    for (var i = 0; i < arr.length; i++) {
        var item = arr[i];
        if (is_rating && (item < 1 || item > 5)) return false;
        counts[item] = counts[item] >= 1 ? counts[item] + 1 : 1;
        if (counts[item] === 2) return false;
    }
    return true;
}

gender_validation = {validator: function(r) { return r == "Male" || r == "Female"; }, message: val_messages['gender'][app.get('env')] }; // TODO: make all lowercase or uppercase

var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; // regex outside for better performance
email_validation = {validator: function(email) { return re.test(email); }, message: val_messages['email'][app.get('env')]};

// Create Volunteer Schema
// _id serves as username
var UserSchema = new Schema(
    { 
        signupType: { type: String, default: 'local' },
        fullUserFormSumitted: { type: Boolean, default: false }, // to ensure that required fields are filled up even with
                                                                 // social media users

        local: {
            password : { type : String, required: this.fullUserFormSumitted || this.signupType === 'local' },
            first_name : { type : String, required : this.fullUserFormSumitted || this.signupType === 'local' },
            last_name : { type : String, required : this.fullUserFormSumitted || this.signupType === 'local' },
            email : { type  : String, required : this.fullUserFormSumitted || this.signupType === 'local' , validate: email_validation } 
        },

        facebook: {
            id: { type: String, required: this.signupType === 'facebook' },
            email: String,
            token: { type: String },
            last_name: { type: String },
            first_name: { type: String },
            full_name: { type: String }
        },

        primary_institution : { type : String, required: this.fullUserFormSumitted || this.signupType === 'local', validate: primary_institution_validation },
        secondary_institution : { type : String, required: this.fullUserFormSumitted || this.signupType === 'local', validate: secondary_institution_validation },
        skills : [{ type : String }],
        skill_ratings: [{type : String }],
        gender: {type: String, validate: gender_validation, required: this.fullUserFormSumitted || this.signupType === 'local'},
        dob: {type: Date, required: this.fullUserFormSumitted || this.signupType === 'local', validate: dob_validation}
    }, 

    {
        timestamps: true  
    }
); 

UserSchema.index({email: 1}, {unique: true}); // TODO: figure out why this doesn't work

UserSchema.path('skills').validate(function(arr){
    if (this.fullUserFormSumitted || this.signupType === 'local') {
        return array_validation(arr, false);
    } return true;
}, val_messages['skills'][app.get('env')]);

UserSchema.path('skill_ratings').validate(function(arr){
    if (this.fullUserFormSumitted || this.signupType === 'local') {
        return array_validation(arr, true);
    } return true;
}, val_messages['skill_ratings'][app.get('env')]);

UserSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

UserSchema.methods.comparePassword = function(password){
    var user = this;
    return bcrypt.compareSync(password, user.local.password);
};

/**
 * Since local/facebook introduces a level of indexing,
 * this function takes care of the added layer
 * @param obj a User
 * @param key eg local.password or skills
 * @param value 
 * Side Effects: Mutates obj
 */
UserSchema.methods.setItem = function (key, value) {
    var user = this;
    key = key.split('.');
    if (key.length === 2) {
        user[key[0]][key[1]] = value;
    } else {
        user[key[0]] = value;
    }
}

UserSchema.methods.getItem = function (key) {
    var user = this;
    key = key.split('.');
    if (key.length === 2) return user[key[0]][key[1]];
    return user[key[0]];
}

module.exports = mongoose.model('User', UserSchema);
