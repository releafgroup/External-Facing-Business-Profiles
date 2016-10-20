var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    bcrypt = require('bcryptjs');
var express = require('express');
var app = express();
var mediaFields = ['profile_photo_data', 'resume_data'];
var randToken = require('rand-token');
var constants = require('../libs/constants');

/**
 * Validation error messages
 */
var genericError = "There was an error saving the volunteer";
var validationMessages = {
    'gender': {'mocha_db': "Gender must be Male or Female", 'development': genericError, 'production': genericError},
    'email': {'mocha_db': "Invalid email format", 'development': genericError, 'production': genericError},
    'skills': {
        'mocha_db': "Skills are required and must all be different",
        'development': genericError,
        'production': genericError
    },
    'skill_ratings': {
        'mocha_db': "Skill Ratings are required and must be between 1 and 5",
        'development': genericError,
        'production': genericError
    },
    'dob': {'mocha_db': "Date must be in the past", 'development': genericError, 'production': genericError},
    'primary_institution': {
        'mocha_db': "Primary institution must be different than secondary",
        'development': genericError,
        'production': genericError
    },
    'secondary_institution': {
        'mocha_db': "Secondary institution must be different than primary",
        'development': genericError,
        'production': genericError
    }
};

// Create custom validators
var currentDate = new Date();
var minDate = new Date(
    currentDate.getFullYear() - 80, currentDate.getMonth(), currentDate.getDate()
);
var maxDate = new Date(
    currentDate.getFullYear() - 15, currentDate.getMonth(), currentDate.getDate()
);

var dobValidation = {
    validator: function (r) {
        return (r < maxDate && r > minDate);
    }, message: validationMessages['dob'][app.get('env')]
};

var primaryInstitutionValidation = {
    validator: function (r) {
        return r != this.secondary_institution;
    }, message: validationMessages['primary_institution'][app.get('env')]
};

var secondaryInstitutionValidation = {
    validator: function (r) {
        return r != this.primary_institution;
    }, message: validationMessages['secondary_institution'][app.get('env')]
};

function skillsValidation(arr) {
    if (!arr) return false;
    if (arr.length === 0) return false;
    var counts = {};

    for (var i = 0; i < arr.length; i++) {
        var item = arr[i];
        counts[item] = counts[item] >= 1 ? counts[item] + 1 : 1;
        if (counts[item] === 2) return false;
    }
    return true;
}

function ratingsValidation(arr) {
    if (!arr) return false;
    if (arr.length === 0) return false;
    for (var i = 0; i < arr.length; i++) {
        if (arr[i] < 1 || arr[i] > 5) return false;
    }
    return true;
}

var genderValidation = {
    validator: function (r) {
        return r == "Male" || r == "Female";
    }, message: validationMessages['gender'][app.get('env')]
}; // TODO: make all lowercase or uppercase

var emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; // regex outside for better performance
var emailValidation = {
    validator: function (email) {
        return emailRegex.test(email);
    }, message: validationMessages['email'][app.get('env')]
};

/**
 * Volunteer Schema
 * _id serves as username
 */
var UserSchema = new Schema(
    {
        signupType: {type: String, default: 'local'},
        fullUserFormSumitted: {type: Boolean, default: false}, // to ensure that required fields are filled up even with
                                                               // social media users
        local: {
            password: {type: String, required: this.signupType === 'local', select: false},
            first_name: {type: String, required: this.signupType === 'local'},
            last_name: {type: String, required: this.signupType === 'local'},
            email: {
                type: String,
                required: this.fullUserFormSumitted || this.signupType === 'local',
                validate: emailValidation
            }
        },
        facebook: {
            id: {type: String, required: this.signupType === 'facebook'},
            email: String,
            token: {type: String},
            last_name: {type: String},
            first_name: {type: String},
            full_name: {type: String}
        },
        primary_institution: {
            type: String,
            required: this.fullUserFormSumitted || this.signupType === 'local',
            validate: primaryInstitutionValidation
        },
        secondary_institution: {
            type: String,
            required: this.fullUserFormSumitted || this.signupType === 'local',
            validate: secondaryInstitutionValidation
        },
        skills: [{type: String}],
        skill_ratings: [{type: String}],
        profile_photo: {type: String},
        resume: {type: String},
        gender: {
            type: String,
            validate: genderValidation,
            required: this.fullUserFormSumitted || this.signupType === 'local'
        },
        dob: {type: Date, required: this.fullUserFormSumitted || this.signupType === 'local', validate: dobValidation},
        favorite: {type: ObjectId, ref: 'Project'},
        is_email_verified: {type: Boolean, default: false},
        email_verification_token: {type: String, default: null},
        verification_token_expires_at: {type: Number, default: 0}
    },

    {
        timestamps: true
    }
);

UserSchema.path('skills').validate(function (arr) {
    if (this.fullUserFormSumitted || this.signupType === 'local') {
        return skillsValidation(arr);
    }
    return true;
}, validationMessages['skills'][app.get('env')]);

UserSchema.path('skill_ratings').validate(function (arr) {
    if (this.fullUserFormSumitted || this.signupType === 'local') {
        return ratingsValidation(arr);
    }
    return true;
}, validationMessages['skill_ratings'][app.get('env')]);

UserSchema.methods.generateHash = function (password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

/**
 * Checks if a password is valid
 * Use before setting the password attribute
 */
UserSchema.methods.validatePassword = function (password) {
    // Check if > 8 characters, includes upper and lowercase, and contains number + letters
    if (password.length < 8) return false;
    if (password.toUpperCase() == password || password.toLowerCase() == password) return false;
    return /^\w+$/.test(password);
};

UserSchema.methods.comparePassword = function (password) {
    var user = this;
    return bcrypt.compareSync(password, user.local.password);
};

/**
 * Since local/facebook introduces a level of indexing,
 * this function takes care of the added layer
 * Side Effects: Mutates obj
 * @param key eg local.password or skills
 * @param value
 */
UserSchema.methods.setItem = function (key, value) {
    var user = this;
    key = key.split('.');

    // Ensures that media fields are not set into object
    if (mediaFields.indexOf(key) == -1) {
        if (key.length === 2) {
            user[key[0]][key[1]] = value;
        } else {
            user[key[0]] = value;
        }
    }
};

UserSchema.methods.getItem = function (key) {
    var user = this;
    key = key.split('.');
    if (key.length === 2) return user[key[0]][key[1]];
    return user[key[0]];
};

/**
 * Generate email verification token and set expirty
 * @returns {*}
 */
UserSchema.methods.getEmailVerificationToken = function () {
    var user = this;

    if (user.email_verification_token === null || user.verification_token_expires_at < Date.now()) {
        user.email_verification_token = randToken.generate(20);
        //TODO: Confirm number of days before token expires, set to 7 for now
        user.verification_token_expires_at = new Date(Date.now() + constants.EMAIL_VERIFICATION_EXPIRY).getTime();
        user.save(function (err) {
            if (err) return false;
        });
    }

    return user.email_verification_token;
};

module.exports = mongoose.model('User', UserSchema);
