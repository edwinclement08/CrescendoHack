var express = require("express"),
	bodyParser = require("body-parser"),
	mongoose = require("mongoose"),
	app = express(),
	methodOverride = require("method-override"),
	flash = require("connect-flash-plus"),
	passport = require("passport"),
	passportLocal = require("passport-local").Strategy,
	// passportFacebook = require("passport-facebook").Strategy,
	// passportGoogle = require('passport-google-oauth').OAuth2Strategy,
	// configAuth = require("./auth.js"),
	User = require("./model/student.js"),
	Event = require("./model/event.js"),
	Bill = require("./model/bill.js"),
	// Comment = require("./model/comments.js"),
	// Pet = require("./model/pet.js"),
	// Story = require("./model/story.js"),
	// seedDB = require('./seedDB'),
	session = require("express-session");
// methodOverride = require("method-override");
setTimeout(() => { mongoose.connect('mongodb://mongo/CrescendoHack') }, 1000)

app.use(methodOverride("_method"));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(__dirname + "/public"));
app.set("view engine", "ejs");
// app.use(cookieParser());
app.use(session({
	secret: "JoshuaNoronha",
	resave: false,
	saveUninitialized: false
}));
app.locals.council = null;
app.locals.admin = null;

app.locals.amount = 0
let event_List = []



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
			if (user.admin) {
				app.locals.admin = user.admin;
			}
			app.locals.username = username
			return done(null, user);
		});

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

// app.use(cors());
// app.get("/points", function (req, res) {
// 	User.find({}, function (err, foundUsers) {
// 		if (!err) {
// 			// console.log(foundUsers)
// 			for (j = 0; j < foundUsers.length; j++) {
// 				for (i = 0; i < classes.length; i++) {
// 					if (foundUsers[j].class) {
// 						// console.log(foundUsers)
// 						if (foundUsers[j].points)
// 							classes[foundUsers[j].class] += foundUsers[j].points
// 					}
// 				}
// 			}
// 			// console.log(foundUsers)
// 			res.render("points", { classes: classes })
// 		}
// 		else {
// 			console.log(err);
// 			req.flash("error", "Please try again after some time ");
// 			res.redirect("/");
// 		}

// 	});
// })


app.get("/councils", function (req, res) {
	res.render("councils")
})
event_list = []
app.get("/events/:id", function (req, res) {
	event_list = []
	thisevent = null;
	Event.findById(req.params.id, (err, foundEvent) => {
		if (err) {
			console.log(err);
			req.flash("error", "Please try again after some time");
			return res.redirect("back");
		} else {
			console.log(foundEvent.user.username[0]);
			console.log(foundEvent.user.username[1]);
			thisevent = foundEvent;
			event_list.push({ username: foundEvent.user.username, points: foundEvent.user.points })
			console.log(JSON.stringify(event_list))
			res.render("event_points", { event: thisevent, event_list: event_list })
		}
	}
	);
});

app.get("/add_bill", function (req, res) {
	// res.send("HElp")
	// Event.find({}, function(a,b){console.log(b)})
	Event.find({}, function (err, stories) {
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
	console.log("Reached here")
	billDetails = req.body
	console.log(billDetails)
	var newBill = new Bill()
	newBill.purpose = billDetails.purpose
	newBill.amount = billDetails.amount
	newBill.members = billDetails.billItemList
	newBill.save(function (err) {
		if (err) {
			console.log("Error in saving new user")
			res.send(err);
		}
		console.log("Registered new User")
		res.redirect("/")
	})
	len = 0
	if (billDetails.billItemList && billDetails.billItemList.length)
		len = billDetails.billItemList.length
	userAmount = billDetails.amount/(len+1)
	app.locals.amount = userAmount
})

app.get("/login", function (req, res) {
	// res.send("HElp")
	res.render("login")
})

app.get("/signup", function (req, res) {
	// res.send("HElp")
	res.render("signup")
})

app.get("/event_details", function (req, res) {
	// res.send("HElp")
	res.render("event_expanded")
})


app.get("/review", function (req, res) {
	res.render("review")
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


class user {

	constructor(name, age, categories) {
		this.name = name;
		this.age = age;
		this.categories = []
		this.categories = categories;
		this.events = [];
	}

	add_users(events) {
		this.events = events;
	}
}

class event {

	constructor(name, details, categories) {
		this.name = name;
		this.details = details;
		this.categories = []
		this.categories = categories;
	}
}

function common_elements(arrs) {
	var resArr = [];
	for (var i = arrs[0].length - 1; i > 0; i--) {
		for (var j = arrs.length - 1; j > 0; j--) {
			if (arrs[j].indexOf(arrs[0][i]) == -1) {
				break;
			}
		}
		if (j === 0) {
			resArr.push(arrs[0][i]);
		}
	}
	return resArr;
}

function sortProperties(obj) {
	// convert object into array
	var sortable = [];
	for (var key in obj)
		if (obj.hasOwnProperty(key))
			sortable.push([key, obj[key]]); // each item is an array in format [key, value]

	// sort items by value
	sortable.sort(function (a, b) {
		var x = a[1],
			y = b[1];
		return x > y ? -1 : x < y ? 1 : 0;
	});
	return sortable; // array in format [ [ key1, val1 ], [ key2, val2 ], ... ]
}

var recommend_items = {};

for (var i = 0, size = event_List.length; i < size; i++) {
	var event_num = event_List[i];
	var user_cat = user1.categories
	//console.log(user.categories )
	var x = user_cat.length; //only change this accordingly this is
	var y = event_num.categories.length;
	var total = x + y;
	var arrays = [user1.categories, event_num.categories];
	var sim = common_elements(arrays);
	var sim_elements = sim.length;
	total = total - sim_elements;
	var corelation = sim_elements / total;

	recommend_items[event_num.name] = corelation;
	console.log(event_num.name + ": " + corelation);
}

var sorted_recommend = sortProperties(recommend_items)
for (var key in sorted_recommend) {
	// check if the property/key is defined in the object itself, not in parent
	if (sorted_recommend.hasOwnProperty(key)) {
		console.log(key, sorted_recommend[key]);
	}
}
