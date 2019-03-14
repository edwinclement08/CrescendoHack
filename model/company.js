var mongoose = require("mongoose");
var bcrypt   = require("bcrypt-nodejs");

var company = new mongoose.Schema({
	name:String,
	jobProfile:String,
	desc:String,
	password:String,
	minCrit:{
		grade:String,
		maxKt:String
	},
	event:[
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Event"
		}
	]
 });
 company.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
company.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};

module.exports = mongoose.model("Company" , company);
