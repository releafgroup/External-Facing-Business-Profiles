var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
var express = require('express');
var app = express();


/**
 * Validation error messages
 */
var genericError = "There was an error saving task for project";
var validationMessages = {
    'due_on': {
        'mocha_db': "Due date must be today or sometime in the future",
        'development': genericError,
        'production': genericError
    }
};

var dueOnValidation = {
    validator: function (value) {
        return value.setHours(0, 0, 0, 0) >= (new Date()).setHours(0, 0, 0, 0);
    },
    message: validationMessages['due_on'][app.get('env')]
};

//TODO: Validate that assigned_to is a project volunteer
var TaskSchema = new Schema({
    title: {type: String, required: true},
    due_on: {type: Date, required: true, validate: dueOnValidation},
    assigned_to: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    is_completed: {type: Boolean, default: false}
}, {
    timestamps: true
});

module.exports = TaskSchema;