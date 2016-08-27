var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var express = require('express');
var app = express();

// Validation error messages
var generic_error = "There was an error saving the project"
var err_messages = {
    'project_description': {'mocha_db': "project description must be less than 1000 characters", 'development': generic_error, 'production': generic_error},
    'core_skill_1': {'mocha_db': "Not a valid skill and/or must be different from 2 and 3", 'development': generic_error, 'production': generic_error},
    'core_skill_2': {'mocha_db': "Not a valid skill and/or must be different from 1 and 3", 'development': generic_error, 'production': generic_error},
    'core_skill_3': {'mocha_db': "Not a valid skill and/or must be different from 1 and 2", 'development': generic_error, 'production': generic_error},
    'industry_focus': {'mocha_db': "Not a valid focus", 'development': generic_error, 'production': generic_error},
}


var company_industry_options = ['Producer/Farmer', 'Processing', 'Transport', 'Storage', 'Manufacturing', 'Trade', 'Distributor/Consumer'];
var skill_options = ['Data Analytics', 'Marketing', 'Web Development', 'App Development', 'Growth Strategy', 'Raising Capital', 'Business Plan', 'SWOT Analysis', 'Competitive Analysis', 'New Market Entry', 'Operations Improvement'];

// Create custom validators
project_description_validation = {validator: function(r) { return r.length <= 1000; }, message: err_messages['project_description'][app.get('env')]};
core_skill_1_validation = {validator: function(r) { return skill_options.indexOf(r) >= 0 && r != this.core_skill_2 && r != this.core_skill_3; }, message: err_messages['core_skill_1'][app.get('env')]};
core_skill_2_validation = {validator: function(r) { return skill_options.indexOf(r) >= 0 && r != this.core_skill_1 && r != this.core_skill_3; }, message: err_messages['core_skill_2'][app.get('env')]};
core_skill_3_validation = {validator: function(r) { return skill_options.indexOf(r) >= 0 && r != this.core_skill_1 && r != this.core_skill_2; }, message: err_messages['core_skill_3'][app.get('env')]};
industry_focus_validation = {validator: function(r) { return company_industry_options.indexOf(r) >= 0; }, message: err_messages['industry_focus'][app.get('env')]};




// Schema to handle assigning voluneers to project
// Stores references to ids of the volunteer and project
var ProjectSchema = new Schema({
    _company : {type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true},
    is_verified : {type: Boolean, required: true},
    project_description : {type : String, required: true, validate : project_description_validation}, 
    core_skill_1 : {type : String, required : true, validate : core_skill_1_validation},
    core_skill_2 : {type : String, validate : core_skill_2_validation},
    core_skill_3 : {type : String, validate : core_skill_3_validation},
    industry_focus : {type : String, required : true, validate : industry_focus_validation},
    completion_time : {type : Number, required : true}, // TODO: figure out max and min
    number_staffed : {type : Number, required : true}, // TODO: add validation, also make sure to de-increment
    favorite_count: {type: Number, default: 0}
}, {
    timestamps: true
});


module.exports = mongoose.model('Project', ProjectSchema);


