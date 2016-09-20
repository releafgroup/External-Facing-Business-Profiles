/**
 * Created by epapa on 20/09/2016.
 */
var exports = module.exports;
var faker = require('faker');
var Company = require('../models/company');
var Project = require('../models/project');

var companyData = {
    "business_name": faker.company.companyName(),
    "primary_contact_name": faker.name.findName(),
    "primary_contact_phone": faker.phone.phoneNumber(),
    "password": "12345678",
    "company_purpose": "Agriculture",
    "company_size": "1 Partner",
    "company_industry_1": "Processing",
    "company_industry_2": "Transport",
    "company_industry_3": "Storage",
    "value_hoped_for": "we hope to get a lot of value",
    "short_term_obj": "short term objective",
    "long_term_obj": "long term objective",
    "pressing_problems": "talent and capital",
    "best_medium": "Email",
    "internet_access": "Work Hours",
    "dummy_data": true
};

var project1Data = {
    "project_name": "Masai Agro Reclaimation",
    "project_description": faker.lorem.sentence(),
    "core_skills": [
        "Consulting",
        "Account Management"
    ],
    "industry_focus": "Storage",
    "completion_time": 10,
    "number_staffed": 5,
    "is_verified": false
};
var project2Data = {
    "project_name": "IT Systems for Agri Growth",
    "project_description": faker.lorem.sentence(),
    "core_skills": [
        "C#",
        "JavaScript",
        "AngularJS"
    ],
    "industry_focus": "Storage",
    "completion_time": 10,
    "number_staffed": 5,
    "is_verified": false
};

exports.addDummyProjects = function () {
    Company.findOne({dummy_data: true}).exec().then(function (company) {
        if (!company) {
            console.log('Inserting dummy projects');
            var companyObj = new Company(companyData);
            companyObj.save().then(function (savedCompany) {
                console.log('Company created successfully');
                project1Data['_company'] = savedCompany._id;
                project2Data['_company'] = savedCompany._id;
                var project = new Project(project1Data);
                var project2 = new Project(project2Data);

                project.save().then(function (project) {
                    console.log("Dummy project 1 inserted");
                    savedCompany.projects.push(project);

                    project2.save().then(function (project2) {
                        console.log("Dummy project 2 inserted");
                        savedCompany.projects.push(project2);

                        savedCompany.save().then(function (savedCompany) {
                            console.log('Projects linked to company');
                        })
                    });
                });
            });
        }
    });
};