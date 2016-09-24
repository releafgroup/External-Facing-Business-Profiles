/**
 * Holds methods, variables and data used during tests.
 */
var exports = module.exports = {};
var faker = require('faker');

exports.url = 'http://localhost:3000';

exports.project1 = {
    'project_name': 'First Project',
    'short_description': 'test_first',
    'long_description': faker.lorem.sentence(),
    'core_skills': [
        'App Development',
        'Growth Strategy',
        'Business Plan'
    ],
    'industry_focus': 'Storage',
    'completion_time': 10,
    'number_staffed': 5,
    'is_verified': false
};

exports.project2 = {
    'project_name': 'Second Project',
    'short_description': 'test_second',
    'long_description': faker.lorem.sentence(),
    'core_skills': [
        'App Development',
        'Growth Strategy',
        'Data Analytics'
    ],
    'industry_focus': 'Storage',
    'completion_time': 10,
    'number_staffed': 5,
    'is_verified': false
};

exports.project3 = {
    'project_name': 'Third Project',
    'short_description': 'test_second',
    'long_description': faker.lorem.sentence(),
    'core_skills': [
        'App Development',
        'Growth Strategy',
        'Social Media'
    ],
    'industry_focus': 'Storage',
    'completion_time': 10,
    'number_staffed': 5,
    'is_verified': true
};

exports.company1 = function () {
    return {
        'business_name': 'business_first',
        'primary_contact_name': 'emmmmmmmmmm o',
        'primary_contact_phone': '+2348008008800',
        'email': faker.internet.email(),
        'password': 'Abc123456',
        'company_purpose': 'the purpose is to test if the creation works',
        'company_size': '1 Partner',
        'company_industry_1': 'Processing',
        'company_industry_2': 'Transport',
        'company_industry_3': 'Storage',
        'value_hoped_for': 'we hope to get a lot of value',
        'short_term_obj': 'short term objective',
        'long_term_obj': 'long term objective',
        'pressing_problems': 'talent and capital',
        'best_medium': 'Email',
        'internet_access': 'Work Hours'
    };
};

exports.company2 = function () {
    return {
        'business_name': 'business_second',
        'primary_contact_name': 'emmmmmmmmmm o',
        'primary_contact_phone': '+2348008008800',
        'email': faker.internet.email(),
        'password': 'eightdigitsboy',
        'company_purpose': 'the purpose is to test if the creation works',
        'company_size': '1 Partner',
        'company_industry_1': 'Processing',
        'company_industry_2': 'Transport',
        'company_industry_3': 'Storage',
        'value_hoped_for': 'we hope to get a lot of value',
        'short_term_obj': 'short term objective',
        'long_term_obj': 'long term objective',
        'pressing_problems': 'talent and capital',
        'best_medium': 'Email',
        'internet_access': 'Work Hours'
    };
};

exports.user1 = {
    'local.first_name': 'test_first',
    'local.last_name': 'test_last',
    'local.password': 'eightdigits1M',
    'local.email': 'test1@gmail.com',
    'primary_institution': 'stanny',
    'secondary_institution': 'odododdo',
    'skills': ['s', 'f', 'o'],
    'skill_ratings': [1, 2, 3],
    'gender': 'Female',
    'dob': '2001-09-23'
};

exports.user2 = {
    'local.first_name': 'test_first',
    'local.last_name': 'test_last',
    'local.password': 'eightdigits1M',
    'local.email': 'test2@gmail.com',
    'primary_institution': 'stanny',
    'secondary_institution': 'odododdo',
    'skills': ['s', 'f', 'o'],
    'skill_ratings': [1, 2, 3],
    'gender': 'Female',
    'dob': '2001-09-23'
};

exports.userUpdateInfo = {
    'local.first_name': 'ififififif',
    'local.last_name': 'testee',
    'local.password': 'eightdigits1M',
    'local.email': 'test1@gmail.com',
    'primary_institution': 'nahhhhh',
    'secondary_institution': 'okayyyyyyyy',
    'skills': ['c', 'l', 't'],
    'skill_ratings': [2, 3, 4],
    'gender': 'Male',
    'dob': '2001-09-23'
};

exports.admin1 = {
    'name': 'admin1@gmail.com',
    'password': 'admin1'
};