const Chat = require("../models/Chat");
const Ride = require("../models/Ride");
const Booking = require("../models/Booking");

const ensureChat = async (rideId) => {
  let chat = await Chat.findOne({ rideId });
  
  const ride = await Ride.findById(rideId);
  if (!ride) throw new Error("Ride not found");

  const bookings = await Booking.find({ ride: rideId, status: "confirmed" });
  let participants = [ride.driver.toString()];
  bookings.forEach((b) => participants.push(b.user.toString()));
  participants = [...new Set(participants)];

  if (!chat) {
    chat = await Chat.create({ rideId, participants, messages: [] });
  } else {
    chat.participants = participants;
    await chat.save();
  }
  return chat;
};

exports.getOrCreateChat = async (req, res) => {
  try {
    await ensureChat(req.params.rideId);          // create if missing

    const chat = await Chat.findOne({ rideId: req.params.rideId })
      .populate("participants", "name email phone")
      .populate("messages.sender",   "name email")
      .populate("messages.receiver", "name email");

    res.json(chat);
  } catch (err) {
    console.error("getOrCreateChat error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.getChatMessages = async (req, res) => {
  try {
    const userId   = req.user.id;
    const { rideId } = req.params;

    const chat = await Chat.findOne({ rideId })
      .populate("participants", "name email phone")
      .populate("messages.sender",   "name email")
      .populate("messages.receiver", "name email");

    if (!chat) return res.json({ messages: [], participants: [] });

    const filtered = chat.messages
      .filter((msg) => {
        const senderId   = msg.sender?._id?.toString()   || msg.sender?.toString();
        const receiverId = msg.receiver?._id?.toString() || msg.receiver?.toString();
        return senderId === userId || receiverId === userId;
      })
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    res.json({ ...chat.toObject(), messages: filtered });
  } catch (err) {
    console.error("getMessages error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const senderId = req.user.id;
    const { rideId, receiverId, message } = req.body;

    if (!message?.trim())  return res.status(400).json({ error: "Message cannot be empty" });
    if (!receiverId)       return res.status(400).json({ error: "receiverId is required" });

    let chat = await ensureChat(rideId);

    
    const senderIsParticipant   = chat.participants.some((p) => p.toString() === senderId);
    const receiverIsParticipant = chat.participants.some((p) => p.toString() === receiverId);

    if (!senderIsParticipant)   return res.status(403).json({ error: "You are not a participant of this ride" });
    if (!receiverIsParticipant) return res.status(400).json({ error: "Receiver is not a participant of this ride" });

    chat.messages.push({
      sender:    senderId,
      receiver:  receiverId,
      rideId,
      message:   message.trim(),
      isRead:    false,
      createdAt: new Date(),
    });
    chat.lastMessage     = message.trim();
    chat.lastMessageTime = new Date();
    await chat.save();

    const updated = await Chat.findById(chat._id)
      .populate("participants", "name email phone")
      .populate("messages.sender",   "name email")
      .populate("messages.receiver", "name email");

    res.json(updated);
  } catch (err) {
    console.error("sendMessage error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.getUserChats = async (req, res) => {
  try {
    const userId = req.user.id;
    const chats  = await Chat.find({ participants: userId })
      .populate("participants", "name email")
      .sort({ lastMessageTime: -1 });
    res.json(chats);
  } catch (err) {
    console.error("getUserChats error:", err);
    res.status(500).json({ error: err.message });
  }
};
