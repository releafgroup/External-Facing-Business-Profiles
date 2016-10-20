var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    bcrypt = require('bcryptjs');
var express = require('express');
var app = express();
var randToken = require('rand-token');
var constants = require('../libs/constants');

// Constants and field enums
var companySizeOptions = ['Sole Proprietor', '1 Partner', '2 - 10 Employees', '11 - 50 Employees',
    '51 - 100 Employees', '100 - 500 Employees', '500+ Employees'];
var companyIndustryOptions = ['Producer/Farmer', 'Processing', 'Transport', 'Storage',
    'Manufacturing', 'Trade', 'Distributor/Consumer'];
var bestMediumOptions = ['Email', 'Whatsapp', 'Text message', 'Phone Call'];
var internetAccessOptions = ['Constant', 'Work Hours', 'Daily', 'Weekly', 'Monthly', 'Less than Monthly'];


// TODO: figure out what we want character limits to be and don't hardcode them into validators
// Validation messages
var genericErrorMessage = "An error occurred saving the company";
var errorMessages = {
    'business_name': {
        'mocha_db': 'Business name must be at most 200 characters',
        'development': genericErrorMessage,
        'production': genericErrorMessage
    },
    'primary_contact_name': {
        'mocha_db': 'Contact name must be at most 200 characters',
        'development': genericErrorMessage,
        'production': genericErrorMessage
    },
    'phone': {
        'mocha_db': 'Phone number format is invalid',
        'development': genericErrorMessage,
        'production': genericErrorMessage
    },
    'email': {
        'mocha_db': 'Email is not in a valid format',
        'development': genericErrorMessage,
        'production': genericErrorMessage
    },
    'company_purpose': {
        'mocha_db': 'Company purposes must be at most 1000 characters',
        'development': genericErrorMessage,
        'production': genericErrorMessage
    },
    'company_size': {
        'mocha_db': 'This is not a valid company size',
        'development': genericErrorMessage,
        'production': genericErrorMessage
    },
    'company_industry': {
        'mocha_db': "Company industry must be part of allowed options and unique",
        'development': genericErrorMessage,
        'production': genericErrorMessage
    },
    'value_hoped_for': {
        'mocha_db': 'Value hoped for must be at most 1000 characters',
        'development': genericErrorMessage,
        'production': genericErrorMessage
    },
    'short_term_obj': {
        'mocha_db': 'Short term obj must be at most 1000 characters',
        'development': genericErrorMessage,
        'production': genericErrorMessage
    },
    'long_term_obj': {
        'mocha_db': 'Long term obj must be at most 1000 characters',
        'development': genericErrorMessage,
        'production': genericErrorMessage
    },
    'pressing_problems': {
        'mocha_db': 'Pressing problems must be at most 1000 characters',
        'development': genericErrorMessage,
        'production': genericErrorMessage
    },
    'best_medium': {
        'mocha_db': 'This is not a valid medium',
        'development': genericErrorMessage,
        'production': genericErrorMessage
    },
    'internet_access': {
        'mocha_db': 'This is not an internet access option',
        'development': genericErrorMessage,
        'production': genericErrorMessage
    }
};

// Create custom validators
var businessNameValidation = {
    validator: function (r) {
        return r.length <= 200;
    }, message: errorMessages['business_name'][app.get('env')]
};
var primaryNameValidation = {
    validator: function (r) {
        return r.length <= 200;
    }, message: errorMessages['primary_contact_name'][app.get('env')]
};

var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; // regex outside for better performance
var emailValidation = {
    validator: function (email) {
        return re.test(email);
    }, message: errorMessages['email'][app.get('env')]
};

var phoneRegex = /^(\+)?(\d)+$/; // regex outside for better performance
var phoneValidation = {
    validator: function (phone) {
        return phoneRegex.test(phone);
    }, message: errorMessages['phone'][app.get('env')]
};

var companyPurposeValidation = {
    validator: function (r) {
        return r.length <= 1000;
    }, message: errorMessages['company_purpose'][app.get('env')]
};

var companySizeValidation = {
    validator: function (r) {
        return companySizeOptions.indexOf(r) >= 0;
    }, message: errorMessages['company_size'][app.get('env')]
};

var valueHopedForValidation = {
    validator: function (r) {
        return r.length <= 1000;
    }, message: errorMessages['value_hoped_for'][app.get('env')]
};
var shortTermObjectiveValidation = {
    validator: function (r) {
        return r.length <= 1000;
    }, message: errorMessages['short_term_obj'][app.get('env')]
};
var longTermObjectiveValidation = {
    validator: function (r) {
        return r.length <= 1000;
    }, message: errorMessages['long_term_obj'][app.get('env')]
};
var pressingProblemsValidation = {
    validator: function (r) {
        return r.length <= 1000;
    }, message: errorMessages['pressing_problems'][app.get('env')]
};

var bestMediumValidation = {
    validator: function (r) {
        return bestMediumOptions.indexOf(r) >= 0;
    }, message: errorMessages['best_medium'][app.get('env')]
};
var internetAccessValidation = {
    validator: function (r) {
        return internetAccessOptions.indexOf(r) >= 0;
    }, message: errorMessages['internet_access'][app.get('env')]
};

var companyIndustryValidation = {
    validator: function (companyIndustries) {
        var companyIndustryCache = [];
        companyIndustries.forEach(function (companyIndustry) {
            if (companyIndustryCache.indexOf(companyIndustry) == -1 && companyIndustryOptions.indexOf(companyIndustry) > -1) {
                companyIndustryCache.push(companyIndustry);
            }
        });
        return companyIndustries.length > 0 && companyIndustries.length == companyIndustryCache.length;
    },
    message: errorMessages['company_industry'][app.get('env')]
};

// TODO: figure out why unique business_name does not work
// TODO: Create endpoint to validate business name to ensure its unique
var CompanySchema = new Schema({
    business_name: {type: String, required: true, unique: true, validate: businessNameValidation},
    primary_contact_name: {type: String, required: true, validate: primaryNameValidation},
    primary_contact_phone: {type: String, required: true, validate: phoneValidation}, // TODO: Format/validate somehow
    password: {type: String, required: true, select: false}, // Validation done through routes bc of hashing
    email: {type: String, required: true, unique: true, validate: emailValidation},
    state: {type: String}, // TODO: ensure within certain list or have some form of validation
    city: {type: String}, // TODO: ensure within certain list or have some form of validation
    company_logo: {type: String}, // TODO: ensure within certain list or have some form of validation
    company_purpose: {type: String, required: true, validate: companyPurposeValidation},
    company_size: {type: String, required: true, validate: companySizeValidation},
    company_industry: {type: [String], required: true, validate: companyIndustryValidation, index: true},
    value_hoped_for: {type: String, required: true, validate: valueHopedForValidation},
    short_term_obj: {type: String, required: true, validate: shortTermObjectiveValidation},
    long_term_obj: {type: String, required: true, validate: longTermObjectiveValidation},
    pressing_problems: {type: String, required: true, validate: pressingProblemsValidation},
    best_medium: {type: String, required: true, validate: bestMediumValidation},
    internet_access: {type: String, required: true, validate: internetAccessValidation},
    projects: [{type: mongoose.Schema.Types.ObjectId, ref: 'Project'}],
    dummy_data: {type: Boolean, default: false},
    is_email_verified: {type: Boolean, default: false},
    email_verification_token: {type: String, default: null},
    verification_token_expires_at: {type: Number, default: 0}
}, {
    timestamps: true
});

CompanySchema.methods.generateHash = function (password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

/**
 * Checks if a password is valid
 * Use before setting the password attribute
 */
CompanySchema.methods.validatePassword = function (password) {
    // Check if > 8 characters, includes upper and lowercase, and contains number + letters
    if (password.length < 8) return false;
    if (password.toUpperCase() == password || password.toLowerCase() == password) return false;
    return /^\w+$/.test(password);
};

CompanySchema.methods.comparePassword = function (password) {
    return bcrypt.compareSync(password, this.password);
};

/**
 * Generate email verification token and set expirty
 * @returns {*}
 * @todo Reuse implementation in User Model
 */
CompanySchema.methods.getEmailVerificationToken = function () {
    var company = this;

    if (company.email_verification_token === null || company.verification_token_expires_at < Date.now()) {
        company.email_verification_token = randToken.generate(20);
        //TODO: Confirm number of days before token expires, set to 7 for now
        company.verification_token_expires_at = new Date(Date.now() + constants.EMAIL_VERIFICATION_EXPIRY).getTime();
        company.save(function (err) {
            if (err) return false;
        });
    }

    return company.email_verification_token;
};

module.exports = mongoose.model('Company', CompanySchema);

