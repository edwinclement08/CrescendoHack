var mongoose = require("mongoose");
var bcrypt = require("bcrypt-nodejs");


var event = new mongoose.Schema({
    name: String,
    place: String,
    attendance: Number,
    points: Number,
    council: String,
    prize: Number,
    cost: Number,
    room: String,
    categories: [],
    date: Date,
    floor: Number,
    time: String,
    date: String,
    desc: String,
    perm: [{
        security: Boolean,
        hod: Boolean,
    }], user: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String,
        points: Number
    }
}, { strict: false });


module.exports = mongoose.model("Event", event);
