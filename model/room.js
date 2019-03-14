var mongoose = require("mongoose");


var room = new mongoose.Schema({
	roomNo:String,
	bookedStatus:[{
        startTime:String,
        endTime:String,
        status:boolean
	}]
 });


module.exports = mongoose.model("Room" , room);