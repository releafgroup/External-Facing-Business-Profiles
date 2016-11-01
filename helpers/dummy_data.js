/**
 * Created by epapa on 20/09/2016.
 */
var exports = module.exports;
var faker = require('faker');
var Company = require('../models/company');
var Project = require('../models/project');

var companyData = {
    "business_name": 'Agro Tech',
    "primary_contact_name": faker.name.findName(),
    "primary_contact_phone": '+23480080000',
    "company_logo": "/img/agrotech-logo.png",
    "email": 'agrotech@mailinator.com',
    "password": "12345678",
    "company_purpose": "Agriculture",
    "company_size": "1 Partner",
    'company_industry': [
        'Processing',
        'Transport',
        'Storage'
    ],
    "value_hoped_for": "we hope to get a lot of value",
    "short_term_obj": "short term objective",
    "long_term_obj": "long term objective",
    "pressing_problems": "talent and capital",
    "best_medium": "Email",
    "internet_access": "Work Hours",
    "dummy_data": true
};

var companyData2 = {
    "business_name": 'Tech Cabal',
    "primary_contact_name": faker.name.findName(),
    "primary_contact_phone": '+23480080000',
    "company_logo": "/img/tech-cabal-logo.png",
    "email": 'techcabal@mailinator.com',
    "password": "12345678",
    "company_purpose": "Agriculture",
    "company_size": "1 Partner",
    'company_industry': [
        'Processing',
        'Transport',
        'Storage'
    ],
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
    "description": faker.lorem.sentence(),
    "project_background": '/img/masai-pic.png',
    "banner_project_img": '/img/banner-image.png',
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
    "description": faker.lorem.sentence(),
    "project_background": '/img/picture-tech-cabal-card.png',
    "banner_project_img": '/img/banner-image.png',
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
                console.log('Company 1 created successfully');
                project1Data['_company'] = savedCompany._id;
                var project = new Project(project1Data);

                project.save().then(function (project) {
                    console.log("Dummy project 1 inserted");
                    savedCompany.projects.push(project);

                    savedCompany.save().then(function (savedCompany) {
                        console.log('Project 1 linked to company 1');
                    })
                });
            });

            companyObj = new Company(companyData2);
            companyObj.save().then(function (savedCompany) {
                console.log('Company 2 created successfully');
                project2Data['_company'] = savedCompany._id;
                var project2 = new Project(project2Data);

                project2.save().then(function (project2) {
                    console.log("Dummy project 2 inserted");
                    savedCompany.projects.push(project2);

                    savedCompany.save().then(function () {
                        console.log('Project 2 linked to company 2');
                    })
                });
            });
        }
    });
};