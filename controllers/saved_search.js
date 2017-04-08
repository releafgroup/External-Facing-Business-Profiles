const jsendResponse = require('../helpers/jsend_response');
const SavedSearch 	= require('../models/saved_search');
const savedSearchValidation = require('../validations/saved_search_validation');
const config = require('../config/config');
const mongoose = require('mongoose');

module.exports = {
	create : function(req, res){
		let requestParams = req.body;
		savedSearchValidation(req.body, (err, value) => {
			if(err){
				return jsendResponse.sendError(err, 400, res);
			}

			let userId 		= requestParams.user_id;
			let title   	= requestParams.title;
			let description = requestParams.description;
			let link 		= requestParams.link;

			var userData 	= {
				'user_id' 		: userId,
				'title'			: title,
				'description'	: description,
				'link'			: link
			};

			var userSave = new SavedSearch(userData);
			
			userSave.save(function(err){
				if(err){
					return jsendResponse.sendError(err,400,res);
				}
				return jsendResponse.sendSuccess(true, res);
			});
		});

	},

	getAll : function(req, res){
		let query = req.params;

		let size = query.size || config.QUERY_LIMIT;
        let page = query.page || 1;

        let errors = [];

        let userId = query.userId ? query.userId : errors.push({'user_id':'missing user id'});

        if(errors.length != 0){
        	return jsendResponse.sendError('Missing userid',400,res);
        }

        SavedSearch.find({'user_id': userId}).limit(parseInt(size)).skip((page - 1) * size).exec(function(err, saved_searches) {
    		if (err) {
                return jsendResponse.sendError('Error occured', 400, res);
            }

        	jsendResponse.sendSuccess(saved_searches, res);
        
        });

	},

	remove : function(req, res){
		let requestParams = req.params;
		let errors = [];

        let id = requestParams.id ? requestParams.id : errors.push({'id':'missing id'});

        if(errors.length != 0){
        	return jsendResponse.sendError('Missing id',400,res);
        }

        SavedSearch.findByIdAndRemove(id, function(err, response){
        	console.log(err);
        	if(err){
        		return jsendResponse.sendError('Could not delete',400,res);
        	}
        	jsendResponse.sendSuccess(true, res);
        });
	},

	edit : function(req, res){
		let requestParams = req.body;
		savedSearchValidation(requestParams, (err, value) => {
			if(err){
				return jsendResponse.sendError(err, 400, res);
			}

			let user_id 	= requestParams.user_id;
			let title   	= requestParams.title;
			let description = requestParams.description;
			let link 		= requestParams.link;
			let id   		= requestParams.id;

			let new_data = {
				'user_id' : user_id,
				'title': title,
				'description': description,
				'link': link
			};

			let user_edit_data = {
				'$set': new_data
			};

        	let condition = {'user_id':user_id, '_id': id};

			SavedSearch.update(condition,user_edit_data, function(err, response){
				if(err){
        			return jsendResponse.sendError('Could not update',400,res);
	        	}

	        	jsendResponse.sendSuccess(new_data, res);
			});

		});

	}
}