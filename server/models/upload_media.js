 var express = require('express');
 var multer = require('multer'),
  bodyParser = require('body-parser'),
      path = require('path');
   var app = express();

	 app.get('/', function(req, res){
  		res.render('index'); });// Choose an image from your box

	 app.post('/', multer({ dest: './uploads/images/'}).single('upl'), function(req,res){
		console.log(req.body); // form fields to use { title: 'abc' }
	// TO DO : DESIGN FORM VIEW...meh! front-end task.
		console.log(req.file);// form file data
		res.status(204).end();
});

	 //TO DO - Consult on Schema for images/media

module.exports = Upload;