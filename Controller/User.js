const user = require("../Models/User");
const { getIO } = require("../Socket/socket");
const {
  comparePassword,
  genrateJwtToken,
  verifyJwtToken,
  authenticateToken,
} = require("../userService");
const jwt = require("jsonwebtoken");
const cloudinary = require("cloudinary").v2;
cloudinary.config({
  cloud_name: "dknt9yjwp",
  api_key: "776796723951685",
  api_secret: "0voWP2qYykN8ogL7ciOhi9xuywk",
});
const userLogin = async (req, res) => {
  try {
    const { userMobile, password } = req.body;
    if (!userMobile && !password) {
      return res.status(404).send({ message: "All Fields are Required" });
    }
    const findUSer = await user.findOne({ userMobile: userMobile });
    if (!findUSer)
      return res.status(400).send({ message: "userMobile Not Found" });
    const checkPassword = comparePassword(findUSer.password, password);
    if (!checkPassword)
      return res.status(404).send({ message: "Invalid Credentials" });
    let jwtToken = genrateJwtToken(findUSer.userMobile, findUSer.password);
    let responseData = {
      id: findUSer._id,
      userName: findUSer.userName,
      userMobile: findUSer.userMobile,
      blockList: findUSer.blockList,
      userImage: findUSer.userImage,
    };
    res.status(200).send({
      statusCode: 200,
      status: true,
      message: "User SuccessFully Logged In",
      data: responseData,
      token: jwtToken,
    });
  } catch (error) {
    console.log(error);
  }
};

const userRegister = async (req, res) => {
  try {
    const file = req.files.userImage;
    cloudinary.uploader.upload(file.tempFilePath, async (err, result) => {
      const { userName, password, userMobile } = req.body;
      if (!userName && !password && !userMobile) {
        return res.status(404), send({ message: "All Fields are Required" });
      }
      const findUSer = await user.findOne({
        userMobile: userMobile,
      });
      if (findUSer)
        return res.status(400).send({ message: "User Already Exist" });
      req.body.userImage = result.url;
      const userdata = await new user(req.body);
      const registered = await userdata.save();
      res.status(201).send(req.body);
    });
  } catch (error) {
    console.log(error);
  }
};

const updateUser = async (req, res) => {
  try {
    const { userName, status } = req.body;
    const decoded = verifyJwtToken(req.headers["authorization"]);
    const { userMobile } = decoded;

    let updateFields = {};
    if (req.files?.userImage) {
      const file = req.files.userImage;

      // Upload the image to Cloudinary
      cloudinary.uploader.upload(file.tempFilePath, async (err, result) => {
        if (result) {
          updateFields.userImage = result.url;
          update(userMobile);
        } else {
          console.error(err);
          res.status(500).json({ message: "Image upload failed" });
        }
      });
    } else {
      // If there is no image to upload, directly update the user
      update(userMobile);
    }

    async function update(userMobile) {
      if (userName) {
        updateFields.userName = userName;
      }

      if (status) {
        updateFields.status = status;
      }

      // Find the user by userMobile and update the fields
      const findByMobileNumber = await user.findOne({ userMobile });

      if (findByMobileNumber) {
        const updatedUser = await user.updateOne(
          { userMobile: userMobile },
          { $set: updateFields },
          { upsert: true }
        );

        res.status(200).json({ message: "User updated successfully" });
      } else {
        res.status(404).json({ message: "User not found" });
      }
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getUserDetail =
  (authenticateToken,
  async (req, res) => {
    const { id } = req.body;
    // const decoded = verifyJwtToken(req.headers["authorization"]);
    // const { userMobile } = decoded;
    const findUser = await user.findOne({ _id: id });
    if (findUser) {
      let response = {
        id: findUser._id,
        userName: findUser.userName,
        status: findUser.status,
        userImage: findUser.userImage,
        userMobile: findUser.userMobile,
      };
      const io = getIO();
      io.io
        .to(io.socketId)
        .emit("joined", { message: "new connection working" });
      res
        .status(200)
        .send({ data: response, message: "user Detail Fetched succefully!" });
    } else {
      res.status(400).send({ message: "Unable to find userDetails!" });
    }
  });
const getAllUser =
  (authenticateToken,
  async (req, res) => {
    try {
      const decoded = verifyJwtToken(req.headers["authorization"]);
      const { userMobile } = decoded;
      const getuser = await user.find(
        { userMobile: { $ne: userMobile } },
        { password: 0 }
      );
      if (getuser) {
        res
          .status(200)
          .send({ data: getuser, message: "User Fetched Successfully" });
      } else {
        res.status(400).send({ message: "Unable to Fetch Users!" });
      }
    } catch (error) {
      console.log(error);
    }
  });
const BlockUser = async (req, res) => {
  try {
    const { userId } = req.body;
    const decoded = verifyJwtToken(req.headers["authorization"]);
    const { userMobile } = decoded;
    const currentUser = await user.findOne({ userMobile });
    const blockedUser = await user.findOne({ _id: userId });
    if (!blockedUser) {
      return res.status(404).send({ message: "Blocked user not found!" });
    }
    const update = { $addToSet: { blockList: userId } };
    const options = { new: true };
    const result = await user.findOneAndUpdate(
      { _id: currentUser._id },
      update,
      options
    );
    let { _id, userName, userImage, status, blockList } = result;
    let response = { id: _id, userName, status, userImage, blockList };
    if (result) {
      return res.status(200).send({
        data: response,
        message: `${blockedUser.userName} Blocked Successfully!`,
      });
    } else {
      return res.status(500).send({ message: "Failed to block user!" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Internal server error" });
  }
};
const unBlockUser = async (req, res) => {
  try {
    const { userId } = req.body;
    const decoded = verifyJwtToken(req.headers["authorization"]);
    const { userMobile } = decoded;
    const currentUser = await user.findOne({ userMobile });
    const blockedUser = await user.findOne({ _id: userId });
    if (!blockedUser) {
      return res.status(404).send({ message: "Blocked user not found!" });
    }
    const update = { $pull: { blockList: userId } };
    const options = { new: true };
    const result = await user.findOneAndUpdate(
      { _id: currentUser._id },
      update,
      options
    );
    let { _id, userName, userImage, status, blockList } = result;
    let response = { id: _id, userName, status, userImage, blockList };
    if (result) {
      return res.status(200).send({
        data: response,
        message: `${blockedUser.userName} Unblocked Successfully!`,
      });
    } else {
      return res.status(500).send({ message: "Failed to block user!" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Internal server error" });
  }
};

module.exports = {
  userLogin,
  getUserDetail,
  getAllUser,
  userRegister,
  updateUser,
  BlockUser,
  unBlockUser,
};
