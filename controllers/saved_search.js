const jsendRepsonse = require('../helpers/jsend_response');
const SavedSearch = require('../models/saved_search');
const savedSearchValidation = require('../models/saved_search_validation');

module.exports = {
	create : function(req, res){
		let requestParams = req.body;
		savedSearchValidation(requestParams, (err, value) => {
			if(err){
				return jsendRepsonse.sendError('Missing details', 400, res);
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





	},

	remove : function(){

	},

	edit : function(){

	}
}