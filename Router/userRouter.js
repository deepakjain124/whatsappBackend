const express = require('express');
const { userLogin, userRegister, updateUser, getUserDetail, getAllUser, BlockUser, unBlockUser } = require('../Controller/User');
const router = express.Router();
const multer=require("multer")
const path = require("path");
const fs = require("fs");
const { sendMessage, getmessage, getPersonalMessages, clearAllChat } = require('../Controller/messages');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const folderPath = "./public/images/user";
        createFolderIfNotExists(folderPath);
        cb(null, folderPath);
    },
    filename: (req, file, cb) => {
      const uniqueFileName =
        "profile-" + Date.now() + path.extname(file.originalname);
      cb(null, uniqueFileName);
    },
  });
  function createFolderIfNotExists(folderPath) {
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }
  }
  const upload = multer({
    storage: storage,
    limits: {
      fileSize: 1024 * 1024 * 5,
    },
  });
router.post('/login', (req, res) => {
    userLogin(req, res);
});

router.post('/register', (req, res) => {
    userRegister(req, res);
});
router.post('/sendmessage',(req, res) => {
  sendMessage(req, res);
});
router.post('/updateUserDetail',(req, res) => {
  updateUser(req, res);
});
router.post('/getUserDetail',(req, res) => {
  getUserDetail(req, res);
});
router.get('/getAllUser',(req, res) => {
  getAllUser(req, res);
});
router.post('/blockUser',(req, res) => {
  BlockUser(req, res);
});
router.post('/unblockUser',(req, res) => {
  unBlockUser(req, res);
});
router.post('/clearChat',(req, res) => {
  clearAllChat(req, res);
});
router.post('/getConversation',(req, res) => {
  getPersonalMessages(req, res);
})
router.post('/getmessage',(req, res) => {
  getmessage(req, res);
});
module.exports=router