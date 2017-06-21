const mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    crypto = require('crypto'),
    config = require('../config/config'),
    jwt = require('jsonwebtoken');


const BusinessOwnerSchema = new Schema({
    email: {
        type: String,
        unique: true,
        required: true
    },
    company_name: {
        type: String,
        required: true
    },
    phone_number: Number,
    location: String,
    company_website: String,
    products: String,
    consumers: String,
    employee_number: Number,
    sector: String,
    ownership_type: String,
    funding_needed: String,
    funding_till_date: String,
    revenue_2015: String,
    revenue_2016: String,
    income_statement_url: String,
    pitch_deck_url: String,
    hash: String,
    salt: String,
    updated: {
		type: Date
	},
	created: {
		type: Date,
		default: Date.now
	},
}, {collection: 'business_owner'});

/**
 * Create instance method for hashing a password
 */
BusinessOwnerSchema.methods.setPassword = function(password){
  this.salt = crypto.randomBytes(128).toString('base64');
  this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, 512, 'sha512').toString('hex');
};

/**
 * Create instance method for validating a password
 */
BusinessOwnerSchema.methods.validPassword = function(password) {
  const hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, 512, 'sha512').toString('hex');
  return this.hash === hash;
};

/**
 * Create instance method for generate token
 */
BusinessOwnerSchema.methods.generateJwt = function() {
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + 2);

  return jwt.sign({
    _id: this._id,
    email: this.email,
    name: this.name,
    exp: parseInt(expiry.getTime() / 1000, 10),
  }, config.SECRET); 
};

module.exports = mongoose.model('BusinessOwner', BusinessOwnerSchema);