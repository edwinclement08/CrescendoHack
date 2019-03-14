var mongoose = require("mongoose");
var bcrypt   = require("bcrypt-nodejs");


var council = new mongoose.Schema({
	name:String,
	password:String,
	email:String,
	member:[
		{
			name:String,
			email:String,
			por:String,
			phone:String,
			photo:String
		}
	],
	event:[
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Event"
		}
	]

 });


council.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
council.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};

module.exports = mongoose.model("Council" , council);
