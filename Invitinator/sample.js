var express= require("express");

var bodyParser= require("body-parser");
var passport=require("passport");
var LocalStrategy=require("passport-local");
var passportLocalMongoose=require("passport-local-mongoose");
var mongoose=require("mongoose");
var User= require("./models/user");
var NewInvitation=require("./models/invitations");
var app=express();


app.use(bodyParser.urlencoded({extended: true}));

mongoose.connect("mongodb://localhost:27017/aunthentication",{useNewUrlParser: true,useUnifiedTopology: true});

 
app.use(require("express-session")({
	secret: "Pt is a hoe",
	resave: false,
	saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.set("view engine","ejs");

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine","ejs");


app.get("/",function(req,res){
	res.render("home");
})

app.get("/secret",isLoggedIn, function(req,res){
	var currentUser=req.user;
	res.render("secret",{currentUser: currentUser});
})

//sign up page code
app.get("/signup",function(req,res){
	res.render("signup");
	})
app.post("/signup",function(req,res){
User.register(new User({username: req.body.username}),req.body.password,function(err,user){
	if(err){
		console.log(err);
		return res.render("signup");
	}
	passport.authenticate("local")(req,res,function(){
		res.redirect("/");
	})
})	
})
//login page
app.get("/login",function(req,res){
	res.render("login")
})
app.post("/login",passport.authenticate("local",{
	successRedirect: "/secret",
	failureRedirect: "/login"
}) ,function(req,res){
	
})
app.get("/logout",function(req,res){
	req.logout();
	res.redirect("/");
})
function isLoggedIn(req,res,next){
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect("/login");
}
app.get("/createInvitation",function(req,res){
	res.render("invitation");
})
app.post("/createInvitation",function(req,res){
	console.log(req.user);
	 var currentUser=req.user;
	 console.log(currentUser);
	console.log(req.body.header);
	
	 NewInvitation.create({senderId: currentUser._id,
	  header: req.body.header,
	  footer: req.body.footer,
	  body: req.body.body},function(err,invitation){
	 	if(err){
	 		res.send("Error");
	 	}else{
	 		console.log(invitation);
	 	}
	 })
	
})
//Dashboard Page
app.get("/dashboard",function(req,res){
	res.render("dashboard");
})
// Displaying created Invitations
app.get("/createdInvitations",function(req,res){
	NewInvitation.find({senderId: req.user._id},function(err,invitations){
		console.log(invitations);
		if(err){
			res.send("Error");
		}
		else
			{
				res.render("createdInvitations",{invitations: invitations})
			}
	})
	app.get("/createdInvitations/:id",function(req,res){
		
		NewInvitation.find({_id: req.params.id},function(err,invitation){
			if(err){
				res.send("Error");
			}
			else{
				console.log(req.params.id);
				console.log(invitation);
				
				res.render("fullInv",{invitation: invitation});
			}
		})
	})
})
//Send Page
app.get("/createdInvitations/:id/send",function(req,res){
	User.find({},function(err,users){
		if(err){
			res.send("Error");
		}
		else{
			res.render("send",{users: users,appUser: app.user});
		}
	})
})
app.get()
app.listen(3000,function(){
	console.log("Server has started");
})