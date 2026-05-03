
const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const { 
  getOrCreateChat, 
  sendMessage, 
  getChatMessages,
  getUserChats
} = require("../controllers/chatController");

router.get("/ride/:rideId", auth, getOrCreateChat);
router.get("/messages/:rideId", auth, getChatMessages);
router.post("/send", auth, sendMessage);
router.get("/my-chats", auth, getUserChats);

module.exports = router;