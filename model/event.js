var mongoose = require("mongoose");
var bcrypt   = require("bcrypt-nodejs");


var event = new mongoose.Schema({
        date:Date,
        name:String,
        place:String,
        cost:String,
        room:String,
        floor:String,
        time:String,
        desc:String,
        perm:[{
            security:Boolean,
            hod:Boolean,		
        }]
 });

module.exports = mongoose.model("Event" , event);
