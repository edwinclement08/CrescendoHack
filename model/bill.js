var mongoose = require("mongoose");
var bcrypt = require("bcrypt-nodejs");

var bill = new mongoose.Schema({
    purpose: String,
    amount: Number,
    members: Array,
    setelled: Boolean,
    poster: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            username: String
        }
    ]
});


module.exports = mongoose.model("Bill", bill);
