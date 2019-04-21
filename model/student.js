var mongoose = require("mongoose");
var bcrypt = require("bcrypt-nodejs");


var user = new mongoose.Schema({
	name: String,
	username: String,
	password: String,
	council: Boolean,
	admin: Boolean,
	email: String,
	phone: Number,
	points: Number,
	class: String,
	categories: []
}

);

user.methods.generateHash = function (password) {
	return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};
user.methods.validPassword = function (password) {
	return bcrypt.compareSync(password, this.password);
};


module.exports = mongoose.model("User", user);