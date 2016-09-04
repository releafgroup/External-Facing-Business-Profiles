var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    bcrypt = require('bcryptjs'); 

var express = require('express');
var app = express();


// Constants and field enums
var company_size_options = ['Sole Proprietor', '1 Partner', '2 - 10 Employees', '11 - 50 Employees', '51 - 100 Employees', '100 - 500 Employees', '500+ Employees'];
var company_industry_options = ['Producer/Farmer', 'Processing', 'Transport', 'Storage', 'Manufacturing', 'Trade', 'Distributor/Consumer'];
var best_medium_options = ['Email', 'Whatsapp', 'Text message', 'Phone Call'];
var internet_access_options = ['Constant', 'Work Hours', 'Daily', 'Weekly', 'Monthly', 'Less than Monthly'];


// TODO: figure out what we want character limits to be and don't hardcode them into validators
// Validation messages
var generic_error_message = "An error occurred saving the company";
var err_messages = {
    'business_name' : {'mocha_db' : 'Business name must be at most 200 characters', 'development' : generic_error_message, 'production' :  generic_error_message},
    'primary_contact_name' : {'mocha_db' : 'Contact name must be at most 200 characters', 'development' : generic_error_message, 'production' :  generic_error_message},
    'email' : {'mocha_db' : 'Email is not in a valid format', 'development' : generic_error_message, 'production' :  generic_error_message},
    'company_purpose' : {'mocha_db' : 'Company purposes must be at most 1000 characters', 'development' : generic_error_message, 'production' :  generic_error_message},
    'company_size' : {'mocha_db' : 'This is not a valid company size', 'development' : generic_error_message, 'production' :  generic_error_message},
    'company_industry_1' : {'mocha_db' : 'This must be a valid industry and cannot be the same as the other industries', 'development' : generic_error_message, 'production' :  generic_error_message},
    'company_industry_2' : {'mocha_db' : 'This must be a valid industry and cannot be the same as the other industries', 'development' : generic_error_message, 'production' :  generic_error_message},
    'company_industry_3' : {'mocha_db' : 'This must be a valid industry and cannot be the same as the other industries', 'development' : generic_error_message, 'production' :  generic_error_message},
    'value_hoped_for' : {'mocha_db' : 'Value hoped for must be at most 1000 characters', 'development' : generic_error_message, 'production' :  generic_error_message},
    'short_term_obj' : {'mocha_db' : 'Short term obj must be at most 1000 characters', 'development' : generic_error_message, 'production' :  generic_error_message},
    'long_term_obj' : {'mocha_db' : 'Long term obj must be at most 1000 characters', 'development' : generic_error_message, 'production' :  generic_error_message},
    'pressing_problems' : {'mocha_db' : 'Pressing problems must be at most 1000 characters', 'development' : generic_error_message, 'production' :  generic_error_message},
    'best_medium' : {'mocha_db' : 'This is not a valid medium', 'development' : generic_error_message, 'production' :  generic_error_message},
    'internet_access' : {'mocha_db' : 'This is not an internet access option', 'development' : generic_error_message, 'production' :  generic_error_message},
};

// Create custom validators
business_name_validation = {validator: function(r) { return r.length <= 200; }, message: err_messages['business_name'][app.get('env')]};
primary_name_validation = {validator: function(r) { return r.length <= 200; }, message: err_messages['primary_contact_name'][app.get('env')]};

var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; // regex outside for better performance
email_validation = {validator: function(email) { return re.test(email); }, message: err_messages['email'][app.get('env')]};

company_purpose_validation = {validator: function(r) { return r.length <= 1000; }, message: err_messages['company_purpose'][app.get('env')]};

company_size_validation = {validator: function(r) { return company_size_options.indexOf(r) >= 0; }, message: err_messages['company_size'][app.get('env')]};
company_industry_1_validation = {validator: function(r) { return company_industry_options.indexOf(r) >= 0 && r != this.company_industry_2 && r != this.company_industry_3; }, message: err_messages['company_industry_1'][app.get('env')]};
company_industry_2_validation = {validator: function(r) { return company_industry_options.indexOf(r) >= 0 && r != this.company_industry_1 && r != this.company_industry_3; }, message: err_messages['company_industry_2'][app.get('env')]};
company_industry_3_validation = {validator: function(r) { return company_industry_options.indexOf(r) >= 0 && r != this.company_industry_1 && r != this.company_industry_2; }, message: err_messages['company_industry_3'][app.get('env')]};

value_hoped_for_validation = {validator: function(r) { return r.length <= 1000; }, message: err_messages['value_hoped_for'][app.get('env')]};
short_term_obj_validation = {validator: function(r) { return r.length <= 1000; }, message: err_messages['short_term_obj'][app.get('env')]};
long_term_obj_validation = {validator: function(r) { return r.length <= 1000; }, message: err_messages['long_term_obj'][app.get('env')]};
pressing_problems_validation = {validator: function(r) { return r.length <= 1000; }, message: err_messages['pressing_problems'][app.get('env')]};

best_medium_validation = {validator: function(r) { return best_medium_options.indexOf(r) >= 0; }, message: err_messages['best_medium'][app.get('env')]};
internet_access_validation = {validator: function(r) { return internet_access_options.indexOf(r) >= 0; }, message: err_messages['internet_access'][app.get('env')]};


// Create Volunteer Schema
// _id serves as username
var CompanySchema = new Schema({
    business_name : {type : String, required: true, unique: true, validate: business_name_validation}, // TODO: figure out why unique this does not work
    primary_contact_name : {type : String, required: true, validate: primary_name_validation},
    primary_contact_phone : {type : String, required: true}, // TODO: Format/validate somehow
    password : {type : String, required: true}, // Validation done through routes bc of hashing
    
    email : {type: String, validate: email_validation},
    state : {type: String}, // TODO: ensure within certain list or have some form of validation
    lca : {type: String}, // TODO: ensure within certain list or have some form of validation

    company_purpose : {type: String, required: true, validate: company_purpose_validation},
    company_size : {type : String, required: true, validate: company_size_validation},
    company_industry_1 : {type : String, required: true, validate: company_industry_1_validation},
    company_industry_2 : {type : String, validate: company_industry_2_validation},
    company_industry_3 : {type : String, validate: company_industry_3_validation},
    value_hoped_for : {type : String, required: true, validate: value_hoped_for_validation},

    short_term_obj : {type : String, required: true, validate: short_term_obj_validation},
    long_term_obj : {type : String, required: true, validate: long_term_obj_validation},
    pressing_problems : {type : String, required: true, validate: pressing_problems_validation},

    best_medium : {type : String, required: true, validate: best_medium_validation},
    internet_access : {type : String, required: true, validate: internet_access_validation},

    projects : [{ type: mongoose.Schema.Types.ObjectId, ref: 'Porject'}]

}, {
    timestamps: true
}); 

module.exports = mongoose.model('Company', CompanySchema);

