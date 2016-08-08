var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    bcrypt = require('bcrypt'); 

// Super Simple Schema to allow access to admin dashboard
var AdminSchema = new Schema({
    password : {type : String, select : false, required: true},
    name : {type : String, required : true, unique: true} // TODO: figure out why not working
}, {
    timestamps: true
});

UserSchema.methods.comparePassword = function(password){ 
    var admin = this;
    return bcrypt.compareSync(password, admin.password);
};

module.exports = mongoose.model('Admin', AdminSchema);
