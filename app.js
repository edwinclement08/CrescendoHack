var express = require("express"),
	bodyParser = require("body-parser"),
	mongoose = require("mongoose"),
	app = express(),
	// flash = require("connect-flash-plus"),
	passport = require("passport"),
	passportLocal=require("passport-local").Strategy,
	// passportFacebook = require("passport-facebook").Strategy,
    // passportGoogle = require('passport-google-oauth').OAuth2Strategy,
	// configAuth = require("./auth.js"),
	// User = require("./model/user.js"),
	// Comment = require("./model/comments.js"),
	// Pet = require("./model/pet.js"),
	// Story = require("./model/story.js"),
	// seedDB = require('./seedDB'),
	session = require("express-session");
	// methodOverride = require("method-override");

app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());
app.use(express.static(__dirname + "/public"));
app.set("view engine","ejs");
// app.use(cookieParser());


setTimeout(() => {mongoose.connect('mongodb://mongo/myappdatabase')}, 1000)
// app.use(cors());
app.use(passport.initialize());
app.use(passport.session());
// app.use(methodOverride("_method"));

app.get("/",function(req,res){
	res.render("index")
})

app.get("/council",function(req,res){
	res.render("council")
})

app.get("/review",function(req,res){
	res.render("review")
})

app.get("/",function(req,res){
	res.render("index")
})
app.listen(3000, function () {
  console.log('Ready');
});

module.exports = app;
