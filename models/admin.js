var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    bcrypt = require('bcryptjs'); 

// Super Simple Schema to allow access to admin dashboard
var AdminSchema = new Schema({
    password : {type : String, required: true},
    name : {type : String, required : true, unique: true} // TODO: figure out why not working
}, {
    timestamps: true
});

AdminSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

AdminSchema.methods.comparePassword = function(password){
    var admin = this;
    return bcrypt.compareSync(password, admin.password);
};

module.exports = mongoose.model('Admin', AdminSchema);
