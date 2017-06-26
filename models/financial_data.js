/**
 * Module dependencies.
 */
const mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Project Schema
 */
const FinancialDataSchema = new Schema({
  owner: {
    type: Schema.ObjectId,
    ref: 'BusinessOwner'
  }
});

module.exports = mongoose.model('Timeline', FinancialDataSchema);
