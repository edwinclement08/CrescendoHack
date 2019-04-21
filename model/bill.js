var mongoose = require("mongoose");
var bcrypt = require("bcrypt-nodejs");

var bill = new mongoose.Schema({
    purpose: String,
    amount: Number,
    members: Array,
    event: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ]
});


module.exports = mongoose.model("Bill", bill);
