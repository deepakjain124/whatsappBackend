const message = require("../Models/messageSchema");

const sendMessage = async (req, res) => {
  try {
    const { text, receiverId, sender } = req.body;
    if (!text || !receiverId || !sender)
      return res.status(400).send({ message: "Message is Required" });

    const messageData = await new message(req.body);
    const saveMessage = await messageData.save();
    res.status(200).send({ message: "message sent successfully" });
  } catch (error) {
    console.log(error);
  }
};
const getmessage = async (req, res) => {
  try {
    const { receiverId, sender } = req.body;
    if (!receiverId || !sender) {
      return res.status(400).send({ message: "Receiver Id is Required" });
    }

    // Execute the find query to retrieve the messages
    try {
      const messages = await message
        .find({
          $or: [
            { receiverId, sender },
            { receiverId: sender, sender: receiverId },
          ],
        })
        .exec();
      return res
        .status(200)
        .send({ messages, message: "Message fetched Succcessfully!" }); // Return the retrieved messages as the response
    } catch (err) {
      console.error(err);
      return res.status(500).send({ message: "Internal server error" });
    }
  } catch (error) {
    console.log(error);
  }
};
const getPersonalMessages=async(req,res)=>{
  console.log("kklklkl")
const {sender}=req.body;
try {
  const messages = await message.aggregate([
    {
      $match: {
        sender: sender,
      },
    },
    {
      $group: {
        _id: "$receiverId",
        senderBObjects: {
          $push: 
            "$$ROOT"
          ,
        },
      },
    },
  ]);

  res.status(200).json({
    data: messages,
    message: "Message fetched successfully!"
  });
} catch (error) {
  console.error(error);
  res.status(500).json({ message: "Internal server error" });
}
}
module.exports = { sendMessage, getmessage,getPersonalMessages };
