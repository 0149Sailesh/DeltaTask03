var mongoose=require("mongoose");
var NewInvitationSchema={
	senderId: String,
	date: Date ,
	senderUsername:String,
	header: String,
	footer: String,
	body: String,
	template:String,
	font: String,
	color:String
}
module.exports=mongoose.model("NewInvitation",NewInvitationSchema);