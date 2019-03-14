var mongoose = require("mongoose");
var bcrypt = require("bcrypt-nodejs");


var facalty = new mongoose.Schema({
	name: String,
	username: String,
	password: String,
	email: String,
	phone: Number,
	resume: {

		education: {

			ug: [

				{
					deg: String,
					clg: String,
					startYear: String,
					endYear: String,
					stream: String,
					scale: String,
					grade: String
				}
			],
			pg: [
				{
					deg: String,
					clg: String,
					startYear: String,
					endYear: String,
					stream: String,
					scale: String,
					grade: String
				}
			],
			phd: [
				{
					deg: String,
					clg: String,
					startYear: String,
					endYear: String,
					stream: String,
					scale: String,
					grade: String
				}
			],
			hsc: {
				school: String,
				yearPass: String,
				board: String,
				scale: String,
				grade: String,
				stream: String
			},
			diploma:
				{
					school: String,
					yearPass: String,
					board: String,
					scale: String,
					grade: String,
					stream: String

				},
			ssc: {
				school: String,
				yearPass: String,
				board: String,
				scale: String,
				grade: String,
				stream: String
			}
		},

		job: [{

			profile: String,
			org: String,
			location: String,
			wfh: Boolean,
			endYear: String,
			startYear: String,
		}],
		por: [String],
		proj: [
			{
				title: String,
				strtMonth: String,
				endMonth: String,
				onGoing: Boolean,
				link: String,
				desc: String
			}
		],
		skills: [String],
		addDetails: [String]
	}
}
);


student.methods.generateHash = function (password) {
	return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
student.methods.validPassword = function (password) {
	return bcrypt.compareSync(password, this.local.password);
};



module.exports = mongoose.model("Student", student);