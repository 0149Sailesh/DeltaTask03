var mongoose=require("mongoose");
var sentInvitationSchema={
	senderId: String,
	receiverId:String,
	invitationId:String,
	status: String,
	response: String
}
module.exports=mongoose.model("sentInvitation",sentInvitationSchema);