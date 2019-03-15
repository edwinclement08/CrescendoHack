var mongoose = require("mongoose");
var bcrypt = require("bcrypt-nodejs");


var student = new mongoose.Schema({
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

student.methods.generateHash = function (password) {
	return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};
student.methods.validPassword = function (password) {
	return bcrypt.compareSync(password, this.password);
};


module.exports = mongoose.model("User", student);