var Project = require('../models/project');
var responseHelper = require('../helpers/response');
var mongoose = require('mongoose');

/** Function for project error handling in saving project info
 * @params: error from saving a project
 * Output: parsed error message
 */
function handleProjectSaveError(err) {
    // If project validation, gets one of the errors to return
    if (err.message == "Project validation failed") {
        var one_error;
        for (first in err.errors) { // Get one of the errors
            one_error = err.errors[first];
            break;
        }
        // If it is one of the required ones i.e. Path 'XXXX' is required we change it to just XXXX is required
        if (/ is required/.test(one_error.message)) {
            one_error.message = one_error.message.replace(/^Path /gi, '');
        }
        err.message = one_error.message;
    }
    return err.message;
}

/**
 * Builds the core skills validation based on the number of core skills
 * @param numberOfCoreSkills
 * @param skills skills to match in condition
 * @returns {Array}
 */
function buildCoreSkillsConditions(numberOfCoreSkills, skills) {
    var coreSkillsConditions = [];
    for (var i = 0; i < numberOfCoreSkills; i++) {
        var obj = {};
        obj['core_skill_' + (i + 1)] = {$in: skills};
        coreSkillsConditions.push(obj);
    }
    return coreSkillsConditions;
}

var exports = module.exports = {};


/** Gets information for given Project id
 * @params: project_id, req, res
 * Output: If successful, {success: true, message : project_info}
 * If not, {success: false, message: error_message}
 * Possible errors are: User not found and networking issues
 */
exports.getProjectById = function (project_id, req, res) {
    Project.findOne({
        '_id': req.params.id
    }).populate('_company').exec(function (err, project) {
        if (!project) return res.json({success: false, message: 'Project not found'});
        if (err) return res.json({success: false, message: err.message});
        res.json({success: true, message: project});
    });
};

/** Updates information for given Project id
 * @params: project_id, req, res
 * Output: If successful, {success: true}
 * If not, {success: false, message: error_message}
 * Possible errors are attempting to modify the project_id, is_verified, or the associated company and deleting a required element
 */
exports.updateProjectById = function (project_id, req, res) {
    Project.findOne({
        '_id': req.params.id
    }, function (err, project) {
        if (!project) return res.json({success: false, message: 'Project not found'});
        if (err) return res.json({success: false, message: err.message});
        for (a in req.body) {
            if (a != "id" && a != "_company" && a != "_id" && a != "is_verified") {
                project[a] = req.body[a];
            } else if (a == "_company") {
                if (project[a] != req.body[a]) return res.json({
                    success: false,
                    message: "You cannot modify the company"
                });
            } else if (a == "is_verified") {
                if (project[a] != req.body[a]) return res.json({
                    success: false,
                    message: "You cannot modify is_verified"
                });
            } else {
                if (project[a] != req.body[a]) return res.json({success: false, message: "You cannot modify the id"});
            }
        }

        project.save(function (err) {
            if (err) {
                return res.json({success: false, message: handleProjectSaveError(err)});
            }
            return res.json({success: true});
        });
    });
};

/** Gets all projects
 * @params: req, res
 * Output: If successful, {success: true, message: list_of_projects}
 * If not, {success: false, message: error_message}
 */
exports.getAllProjects = function (req, res) {

    Project.find().populate('_company').exec(function (err, projects) {
        if (err) return res.json({success: false, message: err.message});
        res.json({success: true, message: projects});
    });

};


/**
 * Gets all projects for a given company id
 * @params company_id, req, res
 * Output: If successful, {success: true, message: list_of_projects}
 * If not, {success: false, message: error_message}
 */
exports.getAllCompanyProjects = function (company_id, req, res) {
    Project.find({
        '_company': company_id
    }).populate('_company').exec(function (err, projects) {
        if (!projects) return res.json({success: false, message: 'company not found'});
        if (err) return res.json({success: false, message: err.message});
        return res.json({success: true, message: projects});
    });
};

/**
 * Gets projects that matches specific skills
 * @param skills Array of skills
 * @param req
 * @param res
 */
exports.getProjectsBySkills = function (skills, req, res) {
    if (!(skills instanceof Array)) {
        return responseHelper.sendError('Skills should be a an array', 400, res);
    }
    Project.find().or({core_skills: {$in: skills}}).populate('_company').exec(function (err, projects) {
        if (err) {
            return responseHelper.sendError(err.message, 500, res);
        }
        return responseHelper.sendSuccess(projects, res);
    });
};

exports.addTask = function (project_id, req, res) {
    Project.findOne({
        '_id': req.params.id
    }, function (err, project) {
        if (!project) return responseHelper.sendError('Project not found', 404, res);
        if (err) return responseHelper.sendError(err.message, 500, res);

        var task = {
            _id: mongoose.Types.ObjectId(),
            title: req.body.title,
            assigned_to: req.body.assigned_to,
            due_on: req.body.due_on
        };
        project.tasks.push(task);

        project.save(function (err) {
            if (err) {
                return responseHelper.sendError(handleProjectSaveError(err), 500, res);
            }
            return responseHelper.sendSuccessWithFullData({id: task._id}, res);
        });

    });
};

exports.getTasks = function (project_id, req, res) {
    Project.findOne({
        '_id': req.params.id
    }, function (err, project) {
        if (!project) return responseHelper.sendError('Project not found', 404, res);
        if (err) return responseHelper.sendError(err.message, 500, res);

        return responseHelper.sendSuccessWithFullData(project.tasks, res);
    });
};

exports.toggleTaskCompleteStatus = function (project_id, task_id, req, res) {
    Project.findById(project_id, function (err, project) {
        if (!project) return responseHelper.sendError('Project not found', 404, res);
        if (err) return responseHelper.sendError(err.message, 500, res);

        var task = project.tasks.id(task_id);
        if (!task) return responseHelper.sendError('Task not found', 404, res);
        task.is_completed = req.body.is_completed;

        task.save(function (err) {
            if (err) return responseHelper.sendError(err.message, 500, res);
            return responseHelper.sendSuccess(true, res);
        });
    });
};

exports.getTask = function (project_id, task_id, req, res) {
    Project.findById(project_id, function (err, project) {
        if (!project) return responseHelper.sendError('Project not found', 404, res);
        if (err) return responseHelper.sendError(err.message, 500, res);

        var task = project.tasks.id(task_id);
        if (!task) return responseHelper.sendError('Task not found', 404, res);
        return responseHelper.sendSuccessWithFullData(task, res);
    });
};