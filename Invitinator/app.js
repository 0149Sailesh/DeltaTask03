var express= require("express");

var bodyParser= require("body-parser");
var passport=require("passport");
var LocalStrategy=require("passport-local");
var passportLocalMongoose=require("passport-local-mongoose");
var mongoose=require("mongoose");
var User= require("./models/user");
var NewInvitation=require("./models/invitations");

var sentInvitation=require("./models/sentInvitations");
var app=express();
app.use(express.static("public"));

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
	
	 var currentUser=req.user;
	
	
	 NewInvitation.create({senderId: currentUser._id,
		senderUsername: currentUser.username,
	  header: req.body.header,
	  footer: req.body.footer,
	  body: req.body.body,
		font: req.body.font,
		date: req.body.deadline	,
		template:req.body.template				  },function(err,invitation){
	 	if(err){
	 		res.send("Error");
	 	}
		 else{
			 res.redirect("/dashboard");
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
				
				User.find({},function(err,users){
					if(err){
						res.send("ERROR");
					}
					else
						{	console.log(req.user);
						 	var appUser=[];
						 appUser.push(req.user);
						 console.log(appUser[0]);
							res.render("fullInv",{invitation: invitation,users: users,appUser: req.user});
						}
				})
				
			}
		})
	})
})
app.get("/createdInvitations/:id/:user",function(req,res){
	sentInvitation.create({senderId: req.user._id,
	receiverId:req.params.user,
	invitationId:req.params.id,
	status: "none"},function(err,sentInvitation){
		if(err){
			res.send("Error");
			
		}
		else{
			console.log(sentInvitation);
			res.redirect("/createdInvitations/"+req.params.id);
		}
	})
	
})

// Displaying inbox
app.get("/inbox",function(req,res){
	sentInvitation.find({receiverId: req.user._id,status:"none"},function(err,inbox){
		if(err){
			res.send("error");
		}
		else{
			var inboxId=[];
			inbox.forEach(function(inbox){
				inboxId.push(inbox.invitationId);
			})
			
				NewInvitation.find({ _id: {$in : inboxId}},function(err,messages){
					if(err){
						res.send("error");
					}
					else{
					
						res.render("inbox",{messages: messages});
					}
					
				})
				
				
		
			 // console.log(messages);
			 	
			}
		})
	})
// displaying full inbox message
app.get("/inbox/:id",function(req,res){
	NewInvitation.find({_id: req.params.id},function(err,invitation){
		if(err){
			res.send("Error");
		}
		else{
			 var deadline = new Date(invitation[0].date);
  				var today = new Date();
			console.log(invitation[0].date);
			console.log(today);
			console.log(deadline.getTime());
			console.log(today.getTime());
			res.render("inboxEx",{invitation: invitation,today: today,deadline: deadline});
		}
	})
})
//Accepting invite
app.get("/accept/:id",function(req,res){
	sentInvitation.updateOne({invitationId: req.params.id,receiverId: req.user._id},{status: "true"},function(err,message){
		if(err){
			res.send("Error");
		}
		else{
			res.redirect("/response/"+req.params.id);
		}
	})
})
//Response
app.get("/response/:id",function(req,res){
	sentInvitation.find({invitationId: req.params.id,receiverId: req.user._id},function(err,message){
		if(err){
			res.send("Error");
		}
		else{
			res.render("response",{message:message});
		}
	})
	
})
app.post("/response/:id",function(req,res){
	sentInvitation.updateOne({invitationId: req.params.id,receiverId: req.user._id},{response: req.body.response},function(err,message){
	if(err){
		res.send("error");
	}
	else{
		res.redirect("/inbox");
	}
	})
})
//View the response from notification
app.get("/viewResponse/:id",function(req,res){
	sentInvitation.find({_id:req.params.id},function(err,message){
		if(err){
			res.send("Error");
		}
		else{
			NewInvitation.find({_id: message[0].invitationId},function(err,invitation){
				console.log(invitation);
				res.render("viewResponse",{message:message,invitation:invitation});
			})
			
		}
	})
})
//Declining invite
app.get("/decline/:id",function(req,res){
	sentInvitation.updateOne({invitationId: req.params.id,receiverId: req.user._id},{status: "false"},function(err,message){
		if(err){
			res.send("Error");
		}
		else{
			res.redirect("/inbox");
		}
	})
})
//Accepted invites
app.get("/acceptedInvitations",function(req,res){
	sentInvitation.find({status:"true",receiverId: req.user._id},function(err,accepted){
		if(err){
			res.send("Error");
		}
		else{
			var acceptedId=[];
			accepted.forEach(function(accepted){
				acceptedId.push(accepted.invitationId);
			})
			NewInvitation.find({ _id: {$in : acceptedId}},function(err,messages){
					if(err){
						res.send("error");
					}
					else{
					
						res.render("acceptedInvitations",{messages: messages});
					}
					
				})
			
		}
	})
})
//Notification on who has accepted
app.get("/notification",function(req,res){
	sentInvitation.find({status:"true",senderId: req.user._id},function(err,accepted){
		if(err){
			res.send("Error");
		}
		else{
			User.find({},function(err,users){
				if(err){
					res.send("Error");
				}
				else{
					res.render("notification",{accepted: accepted,users: users});
				}
			})
		}
	})
})


app.listen(3000,function(){
	console.log("Server has started");
})