"use strict";

module.exports = function (sequelize, DataTypes) {
    return sequelize.define("UserCredential", {
        email: DataTypes.STRING,
        password: DataTypes.STRING
    }, {
        tableName: 'user_credentials'
    });
};