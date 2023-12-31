const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema(
  {
    receiverId: {
      type: String,
    },
    sender: {
      type: String,
    },
    text: {
      type: String,
    },
    started:{
      type:Boolean
    }
  },
  { timestamps: true }
);

const message=new mongoose.model("message", MessageSchema);
module.exports=message