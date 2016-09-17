var express = require('express');
var router = express.Router();
var Project = require('../models/project');
var Company = require('../models/company');
var projectFunctions = require('../utils/project_functions');
var utils = require('../helpers/permission');
var responseHelper = require('../helpers/response');

// Function for project error handling in saving project info
function handleProjectSaveError(err) {
    // If project validation, gets one of the errors to return
    if (err.message == "Project validation failed") {
        var oneError;
        for (first in err.errors) { // Get one of the errors
            oneError = err.errors[first];
            break;
        }
        // If it is one of the required ones i.e. Path 'XXXX' is required we change it to just XXXX is required
        if (/ is required/.test(oneError.message)) {
            oneError.message = oneError.message.replace(/^Path /gi, '');
        }
        err.message = oneError.message;
    }
    return err.message;
}


router.route('/')
    .post(function (req, res) { // Assumes company id is passed in as '_company'
        var project = new Project();
        // Populate Information
        for (a in req.body) {
            project[a] = req.body[a];
        }

        if (project['is_verified'] == true) return res.json({success: false, message: "Cannot set verified to true"});

        // First make sure company is real and can be found
        Company.findOne({
            '_id': project['_company']
        }, function (err, company) {

            if (!company) return responseHelper.sendError('Company not found', 400, res);
            if (err) return responseHelper.sendError(err.message, 500, res);
            // Next save project
            project.save(function (projectErr, project) {
                if (projectErr) {
                    return responseHelper.sendError(handleProjectSaveError(projectErr), 500, res);
                }

                // Finally, add to company schema
                company.projects.push(project);
                company.save(function (finalErr, succ) {
                    if (!finalErr) return responseHelper.sendSuccessWithFullData({id: project.id}, res); // Returns project id
                    return responseHelper.sendError(finalErr.message, 500, res);
                });
            });
        });
    });

router.route('/:id')
    .get(function (req, res) { // TODO: add in extracting info from company
        return projectFunctions.getProjectById(req.params.id, req, res);
    })
    .put(function (req, res) {
        return projectFunctions.updateProjectById(req.params.id, req, res);
    })
    .delete(function (req, res) {
        Project.remove({
            '_id': req.params.id
        }, function (err, result) {
            if (err) return responseHelper.sendError(err.message, 500, res);

            // TODO: delete from company's array and add unit test in mocha
            // TODO: delete from VolunteerAssignment and add unit test in mocha
            return responseHelper.sendSuccess(true, res);
        });
    });

/**
 * Get matched projects based on skills
 */
router.route('/').get(utils.isLoggedIn, function (req, res) {
    if (!utils.checkUserProfilePermission(req, res)) {
        return responseHelper.sendError('No permission', 403, res);
    }
    var skills = req.query.skills;
    if(!skills) {
        return responseHelper.sendError('Skills is required', 400, res);
    }
    skills = skills.split(',');
    return projectFunctions.getProjectsBySkills(skills, req, res);
});

module.exports = router;
