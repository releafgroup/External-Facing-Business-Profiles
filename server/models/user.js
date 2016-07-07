var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    bcrypt = require('bcrypt'); 


var UserSchema = new Schema({
    username : {type: String, required : true, index : {unique : true}}, 
    password : {type : String, required : true ,select : false}, 
    email : { type  : String, required : true}, 
    bio : { type : String}, 
    __v : {type  : Number, select : false}

}); 

UserSchema.methods.comparePassword = function(password){ 
    var user = this;
    return bcrypt.compareSync(password, user.password);
};

module.exports = mongoose.model('User', UserSchema);
