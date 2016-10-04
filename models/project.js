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
    'long_description': {
        'mocha_db': "long description must be less than 1000 characters",
        'development': genericError,
        'production': genericError
    },
    'short_description': {
        'mocha_db': "short description must be less than 140 characters",
        'development': genericError,
        'production': genericError
    },
    'core_skills': {
        'mocha_db': "Core skills must be part of allowed options and unique",
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

var longDescriptionValidation = {
    validator: function (r) {
        return r.length <= 1000;
    }, message: errorMessages['long_description'][app.get('env')]
};

var shortDescriptionValidation = {
    validator: function (r) {
        return r.length <= 140;
    }, message: errorMessages['short_description'][app.get('env')]
};

var coreSkillsValidation = {
    validator: function (skills) {
        var skillsCache = [];
        skills.forEach(function (skill) {
            if (skillsCache.indexOf(skill) == -1 && skillOptions.indexOf(skill) > -1) {
                skillsCache.push(skill);
            }
        });
        return skills.length == skillsCache.length;
    },
    message: errorMessages['core_skills'][app.get('env')]
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
    long_description: {type: String, required: true, validate: longDescriptionValidation},
    short_description: {type: String, required: true, validate: shortDescriptionValidation},
    project_background: {type: String},
    banner_project_img: {type: String},
    core_skills: {type: [String], validate: coreSkillsValidation, index: true},
    industry_focus: {type: String, required: true, validate: industryFocusValidation},
    completion_time: {type: Number, required: true}, // TODO: figure out max and min
    number_staffed: {type: Number, required: true} // TODO: add validation, also make sure to de-increment
}, {
    timestamps: true
});


module.exports = mongoose.model('Project', ProjectSchema);


