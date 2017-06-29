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
        ref: 'BusinessOwner',
        required: true
    },
    rev_2012: String,
    rev_2013: String,
    rev_2014: String,
    rev_2015: String,
    rev_2016: String,
    fixed_cost_2012: String,
    fixed_cost_2013: String,
    fixed_cost_2014: String,
    fixed_cost_2015: String,
    fixed_cost_2016: String,
    variable_cost_2012: String,
    variable_cost_2013: String,
    variable_cost_2014: String,
    variable_cost_2015: String,
    variable_cost_2016: String,
    asset_value: String,
    asset_desc: String,
    liability_value: String,
    liability_desc: String,
    equity_desc: String,
    projection_begin: {type: Boolean, default: false},
    projection_complete: {type: Boolean, default: false}
}, {collection: 'financial_data'});

module.exports = mongoose.model('FinancialDataSchema', FinancialDataSchema);