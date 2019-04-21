var express = require("express"),
	bodyParser = require("body-parser"),
	mongoose = require("mongoose"),
	app = express(),
	fs = require("fs"),
	csv = require("csv"),
	parse = require('csv-parse'),
	methodOverride = require("method-override"),
	flash = require("connect-flash-plus"),
	passport = require("passport"),
	formidable = require('formidable'),
	passportLocal = require("passport-local").Strategy,
	// passportFacebook = require("passport-facebook").Strategy,
	// passportGoogle = require('passport-google-oauth').OAuth2Strategy,
	User = require("./model/user.js"),
	Bill = require("./model/bill.js"),
	session = require("express-session");
setTimeout(() => { mongoose.connect('mongodb://mongo/CrescendoHack') }, 1000)

app.use(methodOverride("_method"));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(__dirname + "/public"));
app.set("view engine", "ejs");
app.use(session({
	secret: "JoshuaNoronha",
	resave: false,
	saveUninitialized: false
}));
app.locals.council = null;
app.locals.admin = null;
var multer = require('multer');
var upload = multer();

app.locals.amount = 0
let event_List = []

// Create the parser
const parser = parse({
	delimiter: ','
})
// Use the readable stream api
parser.on('readable', function () {
	let record
	while (record = parser.read()) {
		output.push(record)
	}
})
// Catch any error
parser.on('error', function (err) {
	console.error(err.message)
})

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use('local-signup', new passportLocal({  // by default, local strategy uses username and password, we will override with email
	usernameField: 'username',
	passwordField: 'password',
	passReqToCallback: true // allows us to pass back the entire request to the callback
},
	function (req, username, password, done) {
		console.log("Reached here")
		process.nextTick(function () {
			// find a user whose email is the same as the forms email
			// we are checking to see if the user trying to login already exists
			User.findOne({ 'local.username': username }, function (err, user) {
				// if there are any errors, return the error
				if (err) {
					console.log("Problem in the database/username")
					return done(err);
				}

				// check to see if theres already a user with that email
				if (user) {
					console.log("User exists")
					return done(null, false, req.flash('error', 'That username is already taken.'));
				} else {

					// if there is no user with that email
					// create the user
					var newUser = new User();
					// console.log(newUser.local)
					// set the user's local credentials
					// newUser.local.username = username;
					// newUser.local.firstname = req.body.fname;
					// newUser.local.lastname = req.body.lname;
					newUser.username = username;
					newUser.password = newUser.generateHash(password);

					// save the user
					newUser.save(function (err) {
						if (err) {
							console.log("Error in saving new user")
							throw err;
						}
						console.log("Registered new User")
						app.locals.username = username
						return done(null, newUser, req.flash("sucess", "You have been registered sucessfully"));
					});
				}

			});

		});

	}

));

passport.use('local-login', new passportLocal({
	// by default, local strategy uses username and password, we will override with email
	usernameField: 'username',
	passwordField: 'password',
	passReqToCallback: true // allows us to pass back the entire request to the callback
},
	function (req, username, password, done) { // callback with email and password from our form
		// console.log("Reached"+username+password)
		// find a user whose email is the same as the forms email
		// we are checking to see if the user trying to login already exists
		User.findOne({ 'username': username }, function (err, user) {
			// if there are any errors, return the error before anything else
			// console.log("Could have found 1")			
			if (err) {
				console.log(err)
				return done(err);
			}

			// if no user is found, return the message
			if (!user) {
				console.log("No user")
				return done(null, false, req.flash('error', 'No user found.')); // req.flash is the way to set flashdata using connect-flash
			}

			// if the user is found but the password is wrong
			console.log(password)
			if (!user.validPassword(password)) {
				// Console.log("Bad pass")
				return done(null, false, req.flash('error', 'Invalid password.')); // create the loginMessage and save it to session as flashdata
			}
			// console.log("SHIT")
			// all is well, return successful user
			console.log(user.council)
			if (user.council) {
				console.log("In here")
				app.locals.council = user.council;
			}
			console.log(JSON.stringify(user))
			if (user.pending_amount) {
				console.log(user.pending_amount)
				app.locals.amount = user.pending_amount;
			}
			if (user.admin) {
				app.locals.admin = user.admin;
			}
			app.locals.username = username
			return done(null, user);
		});
		//
	}));
passport.serializeUser(function (user, done) {
	done(null, user.id);
});
passport.deserializeUser(function (id, done) {
	User.findById(id, function (err, user) {
		done(err, user);
	});
});
app.use(function (req, res, next) {
	res.locals.currentUser = req.user;
	res.locals.error = req.flash("error");
	res.locals.sucess = req.flash("sucess");
	next();
});

app.get("/add_bill", function (req, res) {
	// res.send("HElp")
	Bill.find({}, function (err, stories) {
		if (!err) {
			console.log(stories)
			res.render("add_bill", { stories: stories });
		}
		else {
			console.log(err);
			req.flash("error", "Please try again after some time ");
			res.redirect("/");
		}

	});
})
app.post("/add_bill", function (req, res) {
	billDetails = req.body
	console.log(billDetails)
	var newBill = new Bill()
	newBill.purpose = billDetails.purpose
	newBill.amount = billDetails.amount
	newBill.members = billDetails.billItemList
	newBill.settled = false
	newBill.save(function (err) {
		if (err) {
			console.log("Error in saving new user")
			res.end(err);
		}
		console.log("Registered new User")
	})
	len = 0
	if (billDetails.billItemList && billDetails.billItemList.length)
		len = billDetails.billItemList.length
	userAmount = billDetails.amount / (len + 1)
	app.locals.amount = userAmount
	if (!billDetails.billItemList)
		members = []
	members = billDetails.billItemList
	members.push(app.locals.username)
	for (j = 0; j < members.length; j++) {
		console.log(members)

		// User.findOneAndUpdate({username:members[i]}, {$set:{amount_pending:newBill.amount}}, function(err, doc){
		// 	console.log("Here")
		// 	if (err) return res.send(500, { error: err });
		// });
		User.findOne({ username: members[j] }, function (err, user) {
			console.log("Found" + JSON.stringify(user))
			if (user) {
				user.amount_pending = newBill.amount;
				user.save(function (err) {
					if (err) {
						console.error('Not saved amount to db!');
					}
				});
			}
		});
	}
	return res.redirect("/");
})

app.get("/upload_bill_csv", function (req, res) {
	res.render("csv_upload")
})

app.post("/upload_bill_csv", function (req, res) {
	var form = new formidable.IncomingForm();
	let fp;
	form.parse(req, function (err, fields, files) {
		// oldpath : temporary folder to which file is saved to
		fp = fs.readFileSync(files.filetoupload.path, 'utf8', function (err, data) {
			console.log(err);
		});
		fp = fp.split("\n")
		// console.log(fp)
		for (i = 0; i < fp.length; i++) {
			fp[i] = fp[i].split(",")

			var newBill = new Bill();
			newBill.members = [fp[i][0]];
			newBill.purpose = fp[i][1];
			newBill.amount = fp[i][2]
			// save the user
			newBill.save(function (err) {
				if (err) {
					console.log("Error in saving from file")
					throw err;
				}
				console.log("Registered one Bill")
				// return done(null, newUser, req.flash("sucess", "You have been registered sucessfully"));
			});
		}
		console.log(fp)
	}
	)
	res.redirect("/review")

})
app.get("/login", function (req, res) {
	res.render("login")
})

app.get("/signup", function (req, res) {
	res.render("signup")
})

app.get("/event_details", function (req, res) {
	// res.send("HElp")
	res.render("event_expanded")
})


app.get("/review", function (req, res) {
	Bill.find({}, function (err, billList) {
		console.log(JSON.stringify(billList))
		res.render("review", { billList: billList })
	})
})



app.post('/signup', passport.authenticate('local-signup', {
	successRedirect: '/', // redirect to the secure profile section
	failureRedirect: '/signup', // redirect back to the signup page if there is an error
	failureFlash: true, // allow flash messages
	successFlash: true
}));

app.post('/login', passport.authenticate('local-login', {
	successRedirect: '/', // redirect to the secure  profile section
	failureRedirect: '/login', // redirect back to the signup page if there is an error
	failureFlash: true, // allow flash messages
	successFlash: true
}));
app.get("/logout", function (req, res) {
	req.logout();
	app.locals.username = null;
	app.locals.admin = null;
	app.locals.council = null;
	app.locals.amount = 0;
	res.redirect("/");
});


app.get("/", function (req, res) {
	res.render("index")
})
app.get("*", function (req, res) {
	res.send("<h1>404 Page Not Found<h1>");
});

app.listen(3000, function () {
	console.log('Ready');
});

module.exports = app;

