"use strict";

module.exports = function (sequelize, DataTypes) {
    return sequelize.define("Investor", {
        email: DataTypes.STRING
    }, {
        tableName: 'investors'
    });
};