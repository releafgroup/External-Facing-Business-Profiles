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
    'core_skills': {
        'mocha_db': "Core skills must be unique",
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

var coreSkillsValidation = {
    validator: function (skills) {
        var skillsCache = [];
        skills.forEach(function (skill) {
            if (skill in skills) {
                return false;
            }
            skillsCache.push(skill);
        });
        return true;
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
    project_description: {type: String, required: true, validate: projectDescriptionValidation},
    core_skills: {type: [String], validate: coreSkillsValidation},
    industry_focus: {type: String, required: true, validate: industryFocusValidation},
    completion_time: {type: Number, required: true}, // TODO: figure out max and min
    number_staffed: {type: Number, required: true} // TODO: add validation, also make sure to de-increment
}, {
    timestamps: true
});


module.exports = mongoose.model('Project', ProjectSchema);


