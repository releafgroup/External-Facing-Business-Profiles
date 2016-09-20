var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var express = require('express');
var app = express();

// Validation error messages
var genericError = "There was an error saving the project";
var errorMessages = {
    'project_name': {
        'mocha_db': 'Business name must be at most 200 characters',
        'development': genericError,
        'production': genericError
    },
    'project_description': {
        'mocha_db': "project description must be less than 1000 characters",
        'development': genericError,
        'production': genericError
    },
    'core_skill_1': {
        'mocha_db': "Not a valid skill and/or must be different from 2 and 3",
        'development': genericError,
        'production': genericError
    },
    'core_skill_2': {
        'mocha_db': "Not a valid skill and/or must be different from 1 and 3",
        'development': genericError,
        'production': genericError
    },
    'core_skill_3': {
        'mocha_db': "Not a valid skill and/or must be different from 1 and 2",
        'development': genericError,
        'production': genericError
    },
    'industry_focus': {'mocha_db': "Not a valid focus", 'development': genericError, 'production': genericError}
};

var projectNameValidation = {
    validator: function (r) {
        return r.length <= 200;
    }, message: errorMessages['project_name'][app.get('env')]
};
var companyIndustryOptions = ['Producer/Farmer', 'Processing', 'Transport', 'Storage', 'Manufacturing',
    'Trade', 'Distributor/Consumer'];
var skillOptions = ['Data Analytics', 'Marketing', 'Web Development', 'App Development', 'Growth Strategy',
    'Raising Capital', 'Business Plan', 'SWOT Analysis', 'Competitive Analysis', 'New Market Entry',
    'Operations Improvement'];

var projectDescriptionValidation = {
    validator: function (r) {
        return r.length <= 1000;
    }, message: errorMessages['project_description'][app.get('env')]
};
var coreSkill1Validation = {
    validator: function (r) {
        return skillOptions.indexOf(r) >= 0 && r != this.core_skill_2 && r != this.core_skill_3;
    }, message: errorMessages['core_skill_1'][app.get('env')]
};
var coreSkill2Validation = {
    validator: function (r) {
        return skillOptions.indexOf(r) >= 0 && r != this.core_skill_1 && r != this.core_skill_3;
    }, message: errorMessages['core_skill_2'][app.get('env')]
};
var coreSkill3Validation = {
    validator: function (r) {
        return skillOptions.indexOf(r) >= 0 && r != this.core_skill_1 && r != this.core_skill_2;
    }, message: errorMessages['core_skill_3'][app.get('env')]
};
var industryFocusValidation = {
    validator: function (r) {
        return companyIndustryOptions.indexOf(r) >= 0;
    }, message: errorMessages['industry_focus'][app.get('env')]
};


// Schema to handle assigning volunteers to project
// Stores references to ids of the volunteer and project
var ProjectSchema = new Schema({
    _company: {type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true},
    is_verified: {type: Boolean, required: true},
    project_name: {type: String, required: true, validate: projectNameValidation},
    project_description: {type: String, required: true, validate: projectDescriptionValidation},
    core_skill_1: {type: String, required: true, validate: coreSkill1Validation},
    core_skill_2: {type: String, validate: coreSkill2Validation},
    core_skill_3: {type: String, validate: coreSkill3Validation},
    industry_focus: {type: String, required: true, validate: industryFocusValidation},
    completion_time: {type: Number, required: true}, // TODO: figure out max and min
    number_staffed: {type: Number, required: true} // TODO: add validation, also make sure to de-increment
}, {
    timestamps: true
});


module.exports = mongoose.model('Project', ProjectSchema);


