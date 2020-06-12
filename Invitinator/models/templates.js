var mongoose=require("mongoose");
var templateSchema={
	senderId: String,
	date: Date ,
	senderUsername:String,
	name:String,
	eventDate:String,
	font: String,
	color:String
}
module.exports=mongoose.model("template",templateSchema);