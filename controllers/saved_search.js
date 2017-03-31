const jsendRepsonse = require('../helpers/jsend_response');
const SavedSearch 	= require('../models/saved_search');
const savedSearchValidation = require('../validations/saved_search_validation');
const config = require('../config/config');

module.exports = {
	create : function(req, res){
		let requestParams = req.body;
		console.log(requestParams);
		savedSearchValidation(requestParams, (err, value) => {
			if(err){
				return jsendRepsonse.sendError(err, 400, res);
			}

			let user_id = requestParams.user_id;
			let title   = requestParams.title;
			let description = requestParams.description;
			let link = requestParams.link;

			var user_data = {
				'user_id' : user_id,
				'title': title,
				'description': description,
				'link': link
			};

			var user_save = new SavedSearch(user_data);
			
			user_save.save(function(err){
				if(err){
					return jsendRepsonse.sendError('Error occured',400,res);
				}
				return jsendRepsonse.sendSuccess(true, res);
			});
		});

	},

	getAll : function(req, res){
		let query = req.query;

		let size = query.size || config.QUERY_LIMIT;
        let page = query.page || 1;

        let errors = [];

        let user_id = query.user_id ? query.user_id : errors.push({'user_id':'missing user id'});

        if(errors.length != 0){
        	return jsendRepsonse.sendError('Missing userid',400,res);
        }

        SavedSearch.find({'user_id': user_id}).limit(parseInt(size)).skip((page - 1) * size).exec(function(err, saved_searches) {
    		if (err) {
                return jsendRepsonse.sendError('Error occured', 400, res);
            }

        	jsendResponse.sendSuccess(saved_searches, res);
        
        });

	},

	remove : function(){
		let requestParams = req.body;
		let errors = [];

        let user_id = requestParams.user_id ? requestParams.user_id : errors.push({'user_id':'missing user id'});
        let id = requestParams.id ? requestParams.id : errors.push({'id':'missing id'});

        if(errors.length != 0){
        	return jsendRepsonse.sendError('Missing userid',400,res);
        }

        condition = {'user_id':user_id, 'id': id};

        SavedSearch.remove(condition, function(err, response){
        	if(err){
        		return jsendRepsonse.sendError('Could not delete',400,res);
        	}
        	jsendResponse.sendSuccess(response, res);
        });
	},

	edit : function(){
		let requestParams = req.body;
		savedSearchValidation(requestParams, (err, value) => {
			if(err){
				return jsendRepsonse.sendError('Missing details', 400, res);
			}

			let user_id = requestParams.user_id;
			let title   = requestParams.title;
			let description = requestParams.description;
			let link = requestParams.link;

			var user_edit_data = {
				'$set':{
					'user_id' : user_id,
					'title': title,
					'description': description,
					'link': link
				}
			};

			SavedSearch.update(condition,user_edit_data, function(err, response){
				if(err){
        			return jsendRepsonse.sendError('Could not update',400,res);
	        	}

	        	jsendResponse.sendSuccess(response, res);
			});

		});

	}
}