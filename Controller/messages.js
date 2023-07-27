const user = require("../Models/User");
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
const getPersonalMessages = async (req, res) => {
  const { sender } = req.body;
  try {
    const messages = await message.aggregate([
      {
        $match: {
          $or: [
            { sender: sender }, // Replace 'b' with the dynamic sender value
            { receiverId: sender }, // Replace 'b' with the dynamic sender value
          ],
        },
      },
      {
        $group: {
          _id: {
            $cond: {
              if: { $eq: ["$sender", sender] }, // Replace 'b' with the dynamic sender value
              then: "$receiverId",
              else: "$sender",
            },
          },
          messages: { $push: "$text" },
          createdAt:{ $push: "$createdAt" }
        },
      },
      {
        $project: {
          messages: { $last: "$messages" },
          createdAt:{$last:"$createdAt"}
        },
      },
    ]);
    const data = await user.find().exec();
    function addImageField(messagesArray, usersArray) {
      const result = messagesArray.map((message) => {
        const user = usersArray.find(
          (user) => user._id.toString() === message._id
        );
        return {
          ...message,
          userImage: user ? user.userImage : null,
          receiverName: user ? user.userName : null,
        };
      });
      return result.sort((a,b)=>{
        if(a.createdAt<b.createdAt){
          return 1
        }
        return -1
      });
    }
    const finalResponse = addImageField(messages, data);
    res.status(200).json({
      data: finalResponse,
      message: "Message fetched successfully!",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
module.exports = { sendMessage, getmessage, getPersonalMessages };

// const msg=[
//   {receiver:a,sender:b,text:hiii},
//   {receiver:b,sender:a,text:bolloooo},
//   {receiver:c,sender:b,text:hello},
//   {receiver:b,sender:c,text:bolo},

// ]
// const output=[
//   {id:a,messages:[hii,bolloooo]},
//   {id:c,messages:[hello,bolo]}
// ]
