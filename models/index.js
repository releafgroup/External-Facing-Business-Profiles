"use strict";

var fs = require("fs");
var path = require("path");
var Sequelize = require("sequelize");
var config = require('../config/config');

var sequelize = new Sequelize(config.database.DB_NAME, config.database.DB_USERNAME, config.database.DB_PASSWORD, {
    host: config.database.DB_HOST,
    dialect: 'mysql'
});

var models = ['user_credential.js', 'investor.js'];

var db = {};

fs
    .readdirSync(__dirname)
    .filter(function (file) {
        return (file.indexOf(".") !== 0) && (models.indexOf(file) !== -1);
    })
    .forEach(function (file) {
        var model = sequelize.import(path.join(__dirname, file));
        db[model.name] = model;
    });

Object.keys(db).forEach(function (modelName) {
    if ("associate" in db[modelName]) {
        db[modelName].associate(db);
    }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;