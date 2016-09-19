var Project = require('../models/project.js');

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

var exports = module.exports = {};


/** Gets information for given Project id
 * @params: project_id, req, res
 * Output: If successful, {success: true, message : project_info}
 * If not, {success: false, message: error_message}
 * Possible errors are: User not found and networking issues
*/
exports.getProjectById = function(project_id, req, res) {
    Project.findOne({
         '_id':req.params.id
    }, function(err, project){
        if(!project) return res.json({ success : false , message : 'Project not found'}); 
        if(err) return res.json({success: false, message: err.message});
        res.json({success: true, message: project});
    });
}

/** Updates information for given Project id
 * @params: project_id, req, res
 * Output: If successful, {success: true}
 * If not, {success: false, message: error_message}
 * Possible errors are attempting to modify the project_id, is_verified, or the associated company and deleting a required element
*/
exports.updateProjectById = function(project_id, req, res) {
    Project.findOne({
        '_id':req.params.id
    }, function(err, project){
        if(!project) return res.json({ success : false , message : 'Project not found'});
        if(err) return res.json({success: false, message: err.message});
        for( a in req.body){
            if(a != "id" && a != "_company" && a != "_id" && a != "is_verified"){
                project[a]  = req.body[a];
            } else if (a == "_company") {
                if (project[a] != req.body[a]) return res.json({ success: false, message : "You cannot modify the company"});
            } else if (a == "is_verified") {
                if (project[a] != req.body[a]) return res.json({ success: false, message : "You cannot modify is_verified"});
            } else {
                if (project[a] != req.body[a]) return res.json({ success: false, message : "You cannot modify the id"});
            }
        }
        
        project.save(function(err){
            if(err){                                                                                       
               return res.json({success: false, message: handleProjectSaveError(err)});                                                                   
            }                                                                                              
            return res.json({success: true});                                                  
        });         
    });
}

/** Gets all projects
 * @params: req, res
 * Output: If successful, {success: true, message: list_of_projects}
 * If not, {success: false, message: error_message}
*/
exports.getAllProjects = function(req, res) {
    
    Project.find(function(err, projects){
        if(err) return res.json({success: false, message: err.message}); 
        res.json({success: true, message: projects}); 
    });

}

