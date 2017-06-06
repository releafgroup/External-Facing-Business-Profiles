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
    name: {
        type: String,
        required: true
    },
    hash: String,
    salt: String
});

/**
 * Create instance method for hashing a password
 */
BusinessOwnerSchema.methods.setPassword = function(password){
  this.salt = crypto.randomBytes(128).toString('base64');
  this.hash = crypto.pbkdf2(password, this.salt, 1000, function() {});
};

/**
 * Create instance method for validating a password
 */
BusinessOwnerSchema.methods.validPassword = function(password) {
  const hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');
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