const user = require("../Models/User");
const { getIO } = require("../Socket/socket");
const {
  comparePassword,
  genrateJwtToken,
  verifyJwtToken,
  authenticateToken,
} = require("../userService");
const jwt = require("jsonwebtoken");

const userLogin = async (req, res) => {
  try {
    const { userMobile, password } = req.body;
    if (!userMobile && !password) {
      return res.status(404), send({ message: "All Fields are Required" });
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
      Password: findUSer.password,
      userImage: findUSer.userImage,
    };
    res.status(200).json({
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
    const { userName, password, userMobile } = req.body;
    if (!userName && !password && !userMobile) {
      return res.status(404), send({ message: "All Fields are Required" });
    }
    const findUSer = await user.findOne({
      userMobile: userMobile,
    });
    if (findUSer)
      return res.status(400).send({ message: "User Already Exist" });
    if (req.file.path && req.file.path !== undefined) {
      req.body.userImage = req.file.path;
    }
    const userdata = await new user(req.body);
    const registered = await userdata.save();
    res.status(201).send(req.body);
  } catch (error) {
    console.log(error);
  }
};

const updateUser =
  (authenticateToken,
  async (req, res) => {
    const tokenCookie = req.cookies.user_access_token;
    const { userName, status } = req.body;
    const decoded = verifyJwtToken(req.headers["authorization"]);
    const { userMobile } = decoded;
    const updateFields = {};
    if (req.file && req.file.path) {
      updateFields.userImage = req.file.path;
    }
    if (userName) {
      updateFields.userName = userName;
    }
    if (status) {
      updateFields.status = status;
    }
    try {
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
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  });
const getUserDetail =
  (authenticateToken,
  async (req, res) => {
    const decoded = verifyJwtToken(req.headers["authorization"]);
    const { userMobile } = decoded;
    const findUser = await user.findOne({ userMobile });
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
      console.log(decoded)
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

module.exports = {
  userLogin,
  getUserDetail,
  getAllUser,
  userRegister,
  updateUser,
};
